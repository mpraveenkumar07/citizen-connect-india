import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Cloud, Lock, Cpu, Layers, Workflow, Globe } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — CivicOS" },
      { name: "description", content: "AI stack, system architecture, data pipeline, and security model powering CivicOS." },
      { property: "og:title", content: "CivicOS Architecture" },
      { property: "og:description", content: "How CivicOS orchestrates AI, government data, and citizen workflows at scale." },
    ],
  }),
  component: Architecture,
});

const aiStack = [
  { role: "Intent detection", model: "Gemini 2.5 Flash", why: "Low-latency multilingual classification with strong Indic support." },
  { role: "Reasoning + orchestration", model: "Gemini 2.5 Pro / GPT-5", why: "Multi-step tool use, document reasoning, complex grievance drafting." },
  { role: "Document OCR", model: "Gemini Vision + Tesseract fallback", why: "Aadhaar, ration cards, certificates in 12+ scripts." },
  { role: "Speech-to-text", model: "AI4Bharat IndicASR / gpt-4o-transcribe", why: "Indic-first ASR; STT gateway fallback for English/Hindi." },
  { role: "Text-to-speech", model: "IndicTTS / gpt-4o-mini-tts", why: "Natural voice in regional languages." },
  { role: "Translation", model: "IndicTrans2", why: "22-language bidirectional translation." },
  { role: "Embeddings + RAG", model: "gemini-embedding-2 + pgvector", why: "Retrieval over schemes, laws, gazettes, department directory." },
  { role: "Agent workflows", model: "AI SDK + tool calling", why: "Deterministic tool graph for filing, tracking, escalation." },
];

const layers = [
  { icon: Layers, t: "Frontend", d: "TanStack Start (React 19, SSR). PWA + native shell via Capacitor. Voice-first UI, WCAG 2.2 AA, offline-first for saved documents." },
  { icon: Workflow, t: "AI Layer", d: "Lovable AI Gateway routes to Gemini/GPT-5. Agent runtime with tool calls: scheme_search, draft_rti, submit_grievance, track_application." },
  { icon: Database, t: "Data", d: "Postgres (primary), pgvector (RAG), Redis (sessions), object storage for documents. CDC pipeline for gazette/PIB/state notification ingest." },
  { icon: Cloud, t: "Backend & Infra", d: "Edge functions for scale-out. India-region deployment (Mumbai/Hyderabad). Multi-AZ. Autoscaling per state cluster." },
  { icon: Lock, t: "Security", d: "DPDP Act aligned. Aadhaar tokenisation, no raw ID storage. Field-level encryption. Consent artefacts logged. SOC 2 target." },
  { icon: Globe, t: "Integrations", d: "DigiLocker, UMANG, CPGRAMS, State grievance portals, e-Sign (Aadhaar/DSC), payment gateways for optional paid filings." },
];

function Architecture() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <Badge variant="outline">Architecture</Badge>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Built for a billion citizens.</h1>
        <p className="mt-4 text-muted-foreground">
          Edge-native, multilingual, and privacy-first. CivicOS is designed to plug into India's existing DPI (Digital Public Infrastructure) rather than replace it.
        </p>
      </div>

      {/* System diagram */}
      <div className="mt-12 rounded-3xl border border-border/60 bg-card p-6 sm:p-10">
        <div className="text-center">
          <Badge variant="secondary" className="gap-1.5"><Cpu className="h-3 w-3" /> System overview</Badge>
        </div>
        <pre className="mt-6 overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
{`  ┌────────────────────────────────────────────────────────────────┐
  │  Citizen  →  Voice / Chat / PWA / Android / IVR / WhatsApp     │
  └────────────────────────────┬───────────────────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Intent + Router     │  (Gemini Flash)
                    └──────────┬───────────┘
                               │
   ┌───────────────┬───────────┼───────────┬───────────────┐
   │               │           │           │               │
   ▼               ▼           ▼           ▼               ▼
Scheme Agent   Rights Agent  Complaint  Tracker Agent   Legal Aid
  (RAG)          (RAG)        Agent       (poller)       (RAG)
   │               │           │           │               │
   └────┬──────────┴─────┬─────┴─────┬─────┴───────┬───────┘
        │                │           │             │
        ▼                ▼           ▼             ▼
   Scheme DB       Constitution   Gov. Portal   NALSA/DLSA
   (pgvector)      + Laws (RAG)   Adapters      Directory
                                  (DigiLocker,
                                   CPGRAMS,
                                   State APIs)
        │
        ▼
   Postgres · Object Store · Redis · Audit Log (DPDP)`}
        </pre>
      </div>

      {/* AI stack */}
      <div className="mt-16">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">AI stack</h2>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Model</th>
                <th className="p-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {aiStack.map((r) => (
                <tr key={r.role} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.role}</td>
                  <td className="p-3 font-mono text-xs text-primary">{r.model}</td>
                  <td className="p-3 text-muted-foreground">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layers */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold">Platform layers</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {layers.map((l) => (
            <div key={l.t} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                <l.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{l.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
