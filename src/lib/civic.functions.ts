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

// ---------- Government Department Finder ----------

export type Department = {
  name: string;
  level: "Central" | "State" | "District" | "Municipal";
  jurisdiction?: string;
  address?: string;
  contact?: string;
  website?: string;
  forms?: string;
  documents?: string;
  next_steps?: string;
  confidence?: "high" | "medium" | "low";
};

const departmentInput = z.object({
  problem: z.string().min(5).max(600),
  state: z.string().min(1).max(80),
  city: z.string().max(80).optional().default(""),
});

export const findDepartment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => departmentInput.parse(d))
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    const prompt = `Citizen problem: "${data.problem}"
Location: ${data.city ? data.city + ", " : ""}${data.state}, India.

Identify the 3-4 most relevant Indian government departments/offices this citizen should approach (mix of Central, State, District, or Municipal as appropriate).
Return ONLY a JSON array (no markdown) of objects:
{"name": string, "level": "Central"|"State"|"District"|"Municipal", "jurisdiction": string, "address": string, "contact": string, "website": string, "forms": string, "documents": string, "next_steps": string, "confidence": "high"|"medium"|"low"}

- "address": general office location guidance (do not fabricate street numbers if unsure — say "District collectorate, <city>" style)
- "contact": known helpline number or portal, else ""
- "website": official gov.in / nic.in URL only if you are confident; else ""
- "forms": name of the form/application to file
- "documents": comma-separated documents required
- "next_steps": 1-2 sentence action plan
Never invent URLs or phone numbers.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only valid JSON arrays. No markdown fences.",
        prompt,
      });
      raw = res.text;
    } catch (e) {
      throw new Error("Failed to find department: " + (e instanceof Error ? e.message : String(e)));
    }

    const s = raw.indexOf("[");
    const e = raw.lastIndexOf("]");
    let departments: Department[] = [];
    if (s >= 0 && e > s) {
      try {
        const parsed = JSON.parse(raw.slice(s, e + 1));
        if (Array.isArray(parsed)) departments = parsed as Department[];
      } catch {
        departments = [];
      }
    }
    return { departments };
  });

// ---------- Policy & Law Update Engine ----------

export type PolicyUpdate = {
  title: string;
  category: "Scheme" | "Law" | "Notification" | "Court Order" | "Deadline";
  date?: string;
  source?: string;
  summary: string;
  why_it_matters?: string;
  action?: string;
  deadline?: string;
  confidence?: "high" | "medium" | "low";
};

const policyInput = z.object({
  state: z.string().min(1).max(80),
  interests: z.string().min(1).max(300),
  occupation: z.string().max(120).optional().default(""),
  timeframe: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export const getPolicyUpdates = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => policyInput.parse(d))
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    const window =
      data.timeframe === "7d" ? "the last 7 days" : data.timeframe === "90d" ? "the last 3 months" : "the last 30 days";
    const prompt = `Generate a personalised policy & law update digest for an Indian citizen.

Profile:
- State: ${data.state}
- Occupation: ${data.occupation || "not specified"}
- Interests / life areas: ${data.interests}
- Timeframe: ${window}

Return ONLY a JSON array (no markdown) of 5-7 recent, realistic Indian policy/law updates relevant to this profile. Each object:
{"title": string, "category": "Scheme"|"Law"|"Notification"|"Court Order"|"Deadline", "date": "YYYY-MM-DD or approx", "source": "Gazette/PIB/Ministry/Supreme Court/High Court/State Govt", "summary": string (2-3 sentences plain language), "why_it_matters": string (1 sentence tied to profile), "action": string (concrete next step), "deadline": string (if any, else ""), "confidence": "high"|"medium"|"low"}

Prefer well-known real developments. If unsure of exact date, use an approximate month and set confidence to "medium" or "low". Never fabricate case numbers or gazette numbers.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only valid JSON arrays. No markdown fences.",
        prompt,
      });
      raw = res.text;
    } catch (e) {
      throw new Error("Failed to fetch updates: " + (e instanceof Error ? e.message : String(e)));
    }

    const s = raw.indexOf("[");
    const e2 = raw.lastIndexOf("]");
    let updates: PolicyUpdate[] = [];
    if (s >= 0 && e2 > s) {
      try {
        const parsed = JSON.parse(raw.slice(s, e2 + 1));
        if (Array.isArray(parsed)) updates = parsed as PolicyUpdate[];
      } catch {
        updates = [];
      }
    }
    return { updates };
  });

// ---------- Rights & Constitution Assistant ----------

export type RightsAnswer = {
  summary: string;
  rights: { title: string; article_or_law?: string; explanation: string }[];
  example?: string;
  what_you_can_do: string[];
  escalation?: string;
  disclaimer: string;
};

const rightsInput = z.object({
  situation: z.string().min(5).max(1500),
  role: z.string().max(80).optional().default(""),
  state: z.string().max(80).optional().default(""),
});

export const explainRights = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => rightsInput.parse(d))
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    const prompt = `An Indian citizen describes a situation and wants to know their rights.

Situation: "${data.situation}"
Role/identity (if any): ${data.role || "not specified"}
State: ${data.state || "not specified"}

Return ONLY a JSON object (no markdown) of shape:
{
  "summary": string (2-3 sentence plain-language overview),
  "rights": [{"title": string, "article_or_law": string (e.g. "Article 21", "Section 498A BNS", "RTI Act 2005 s.6"), "explanation": string}],
  "example": string (a realistic short scenario, optional),
  "what_you_can_do": [string, string, ...] (3-5 concrete steps),
  "escalation": string (who to approach if the first step fails),
  "disclaimer": "This is legal information, not legal advice. For representation, use the Legal Aid Finder."
}

Cite real Indian constitutional articles, acts, and sections. Never fabricate. If unsure of a specific section, describe the right without citing a number.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only a valid JSON object. No markdown fences.",
        prompt,
      });
      raw = res.text;
    } catch (e) {
      throw new Error("Failed to explain rights: " + (e instanceof Error ? e.message : String(e)));
    }

    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    let answer: RightsAnswer | null = null;
    if (s >= 0 && e > s) {
      try {
        answer = JSON.parse(raw.slice(s, e + 1)) as RightsAnswer;
      } catch {
        answer = null;
      }
    }
    return { answer };
  });

// ---------- Application Tracker ----------

export type TrackerStatus = {
  stage: string;
  status: "On track" | "Delayed" | "Action needed" | "Closed";
  typical_timeline: string;
  next_step: string;
  deadline_note?: string;
  escalation_path?: string;
  helpline?: string;
};

const trackerInput = z.object({
  applicationType: z.string().min(2).max(120),
  authority: z.string().min(2).max(200),
  filedOn: z.string().min(4).max(40),
  referenceId: z.string().max(120).optional().default(""),
  lastUpdate: z.string().max(500).optional().default(""),
});

export const trackApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => trackerInput.parse(d))
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    const prompt = `Estimate the current status of a citizen's application filed with an Indian government authority.

Application type: ${data.applicationType}
Authority: ${data.authority}
Filed on: ${data.filedOn}
Reference ID: ${data.referenceId || "not provided"}
Last known update from citizen: ${data.lastUpdate || "none"}

Return ONLY a JSON object (no markdown):
{
  "stage": string (likely current stage in the process, e.g. "Under verification at Tehsildar office"),
  "status": "On track" | "Delayed" | "Action needed" | "Closed",
  "typical_timeline": string (statutory or expected timeline, e.g. "RTI: 30 days"),
  "next_step": string (what the citizen should do now),
  "deadline_note": string (if a statutory deadline has passed or is near, note it),
  "escalation_path": string (First Appellate Authority, State Info Commission, CPGRAMS, ombudsman, etc.),
  "helpline": string (relevant helpline / portal, only if you are confident)
}

Base timelines on real Indian rules (RTI Act 30 days, CPGRAMS 30 days, passport ~30 days, etc.). Never invent reference numbers.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only a valid JSON object. No markdown fences.",
        prompt,
      });
      raw = res.text;
    } catch (e) {
      throw new Error("Failed to track application: " + (e instanceof Error ? e.message : String(e)));
    }

    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    let status: TrackerStatus | null = null;
    if (s >= 0 && e > s) {
      try {
        status = JSON.parse(raw.slice(s, e + 1)) as TrackerStatus;
      } catch {
        status = null;
      }
    }
    return { status };
  });

// ---------- Legal Aid Finder ----------

export type LegalAidContact = {
  name: string;
  type: "NALSA" | "State DLSA" | "Helpline" | "NGO" | "Emergency";
  scope?: string;
  contact?: string;
  address?: string;
  website?: string;
  when_to_use?: string;
  free?: boolean;
};

const legalAidInput = z.object({
  issue: z.string().min(5).max(600),
  state: z.string().min(1).max(80),
  city: z.string().max(80).optional().default(""),
  urgency: z.enum(["emergency", "urgent", "normal"]).default("normal"),
});

export const findLegalAid = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => legalAidInput.parse(d))
  .handler(async ({ data }) => {
    const ai = createLovableAi();
    const prompt = `A citizen needs legal aid in India.

Issue: "${data.issue}"
Location: ${data.city ? data.city + ", " : ""}${data.state}
Urgency: ${data.urgency}

Return ONLY a JSON array (no markdown) of 4-6 relevant contacts, mixing NALSA, State DLSA, national helplines, NGOs, and emergency numbers as appropriate:
{"name": string, "type": "NALSA"|"State DLSA"|"Helpline"|"NGO"|"Emergency", "scope": string, "contact": string (real, well-known helpline number only — e.g. 112, 181, 1098, 15100, 1091 — else ""), "address": string, "website": string (official domain only if confident, else ""), "when_to_use": string, "free": boolean}

If urgency is "emergency", put the most relevant emergency number first (112 all-India, 1091 women, 1098 child, 100 police, 108 medical). Never invent phone numbers or addresses.`;

    let raw = "";
    try {
      const res = await generateText({
        model: ai(MODEL),
        system: "You output only valid JSON arrays. No markdown fences.",
        prompt,
      });
      raw = res.text;
    } catch (e) {
      throw new Error("Failed to find legal aid: " + (e instanceof Error ? e.message : String(e)));
    }

    const s = raw.indexOf("[");
    const e = raw.lastIndexOf("]");
    let contacts: LegalAidContact[] = [];
    if (s >= 0 && e > s) {
      try {
        const parsed = JSON.parse(raw.slice(s, e + 1));
        if (Array.isArray(parsed)) contacts = parsed as LegalAidContact[];
      } catch {
        contacts = [];
      }
    }
    return { contacts };
  });


