import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAi } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

const CIVIC_SYSTEM = `You are CivicOS, an AI assistant for Indian citizens navigating government services.
- Help with schemes, RTI, complaints, documents, taxes, pensions, welfare, and citizen rights.
- Be concise, practical, and use plain language. Prefer bullet points and step-by-step guidance.
- Cite the department / act / portal when relevant (e.g. RTI Act 2005, CPGRAMS, DigiLocker, PM-KISAN).
- If unsure or if a rule varies by state, say so and ask for the user's state.
- Never fabricate scheme names, section numbers, or URLs. If you don't know, say so.
- Respond in the same language the user writes in (English, Hindi, or Hinglish).`;

// ---------- Threads ----------

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .insert({ user_id: context.userId, title: "New chat" })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const getMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .delete()
      .eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Chat send (non-streaming, saves both sides) ----------

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      threadId: z.string().uuid(),
      content: z.string().min(1).max(4000),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load prior messages
    const { data: prior } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true })
      .limit(30);

    // Insert user message
    const { error: uErr } = await supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: data.content,
    });
    if (uErr) throw new Error(uErr.message);

    const ai = createLovableAi();
    const messages = [
      ...(prior ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: data.content },
    ];

    let assistantText = "";
    try {
      const { text } = await generateText({ model: ai(MODEL), system: CIVIC_SYSTEM, messages });
      assistantText = text;

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) throw new Error("Rate limit reached. Please try again in a moment.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please top up your workspace.");
      throw new Error("Assistant failed to respond: " + msg);
    }

    await supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "assistant",
      content: assistantText,
    });

    // Update thread title from first user message + bump updated_at
    const title = (prior?.length ?? 0) === 0
      ? data.content.slice(0, 60)
      : undefined;
    await supabase
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString(), ...(title ? { title } : {}) })
      .eq("id", data.threadId);

    return { assistant: assistantText };
  });

// ---------- Scheme eligibility ----------

export type Scheme = {
  name: string;
  department?: string;
  eligibility?: string;
  benefit?: string;
  how_to_apply?: string;
  confidence?: "high" | "medium" | "low";
};

const schemeProfile = z.object({
  state: z.string().min(1),
  age: z.number().int().min(0).max(120),
  gender: z.string().min(1),
  occupation: z.string().min(1),
  annualIncome: z.number().int().min(0),
  category: z.string().optional().default("General"),
  extra: z.string().max(500).optional().default(""),
});

export const findSchemes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schemeProfile.parse(d))
  .handler(async ({ data, context }) => {
    const ai = createLovableAi();
    const prompt = `A citizen profile:
- State: ${data.state}
- Age: ${data.age}
- Gender: ${data.gender}
- Occupation: ${data.occupation}
- Annual household income (INR): ${data.annualIncome}
- Social category: ${data.category}
- Additional context: ${data.extra || "none"}

List the 6 most relevant Indian central + state government welfare schemes this person likely qualifies for.
Return ONLY a JSON array (no markdown, no prose) with objects of shape:
{"name": string, "department": string, "eligibility": string, "benefit": string, "how_to_apply": string, "confidence": "high"|"medium"|"low"}
Only include schemes you are confident exist. Prefer well-known central schemes when unsure of state-specific ones.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only valid JSON arrays. No markdown fences.",
        prompt,
      });
      raw = res.text;

    } catch (e) {
      throw new Error("Failed to fetch schemes: " + (e instanceof Error ? e.message : String(e)));
    }

    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    let schemes: Scheme[] = [];
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      try {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        if (Array.isArray(parsed)) schemes = parsed as Scheme[];
      } catch {
        schemes = [];
      }
    }

    await context.supabase.from("scheme_searches").insert({
      user_id: context.userId,
      profile: data,
      results: schemes as unknown as never,
    });

    return { schemes };
  });

// ---------- Complaint / RTI generator ----------

const complaintInput = z.object({
  kind: z.enum(["complaint", "rti"]),
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(300),
  authority: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  details: z.string().min(10).max(3000),
  language: z.enum(["English", "Hindi"]).default("English"),
});

export const generateComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => complaintInput.parse(d))
  .handler(async ({ data, context }) => {
    const ai = createLovableAi();
    const isRti = data.kind === "rti";
    const instruction = isRti
      ? `Draft a formal RTI application under the Right to Information Act, 2005 addressed to the Public Information Officer of the given authority. Follow the standard format: applicant details, subject, information sought (numbered points), declaration of citizenship, application fee note (Rs. 10), place & date, signature line.`
      : `Draft a formal grievance / complaint letter to the given authority. Follow the standard format: applicant details, date, addressee, subject line, respectful body (background, issue, requested action, timeline), closing, signature line.`;

    const prompt = `${instruction}

Applicant: ${data.name}
Address: ${data.address}
Authority: ${data.authority}
Subject: ${data.subject}
Details from citizen: ${data.details}

Write the full letter in ${data.language}. Keep it professional, factual, and under 400 words.
Output only the letter text. No preamble, no markdown fences.`;

    let text = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You are a legal drafting assistant for Indian citizens.",
        prompt,
      });

      text = res.text.trim();
    } catch (e) {
      throw new Error("Failed to draft letter: " + (e instanceof Error ? e.message : String(e)));
    }

    const { data: saved, error } = await context.supabase
      .from("complaint_drafts")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        subject: data.subject,
        authority: data.authority,
        input_data: data,
        generated_text: text,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: saved.id, text };
  });
