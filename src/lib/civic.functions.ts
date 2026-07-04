import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAi } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

const CIVIC_SYSTEM = `You are CivicOS, an AI assistant for Indian citizens navigating government services.
- Help with schemes, RTI, complaints, documents, taxes, pensions, welfare, and citizen rights.
- Be concise, practical, and use plain language. Prefer bullet points and step-by-step guidance.
- Cite the department / act / portal when relevant (e.g. RTI Act 2005, CPGRAMS, DigiLocker, PM-KISAN).
- If unsure or if a rule varies by state, say so and ask for the user's state.
- Never fabricate scheme names, section numbers, or URLs. If you don't know, say so.
- Respond in the same language the user writes in (English, Hindi, or Hinglish).`;

// ---------- Chat (stateless, no auth) ----------

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(4000),
          })
        )
        .min(1)
        .max(40),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    try {
      const { text } = await generateText({
        model: ai(MODEL),
        system: CIVIC_SYSTEM,
        messages: data.messages,
      });
      return { assistant: text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) throw new Error("Rate limit reached. Please try again in a moment.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please top up your workspace.");
      throw new Error("Assistant failed to respond: " + msg);
    }
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
  .inputValidator((d: unknown) => schemeProfile.parse(d))
  .handler(async ({ data }) => {
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
  .inputValidator((d: unknown) => complaintInput.parse(d))
  .handler(async ({ data }) => {
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

    return { id: crypto.randomUUID(), text };
  });
