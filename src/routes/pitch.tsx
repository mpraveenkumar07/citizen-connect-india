import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Investor Pitch — CivicOS" },
      { name: "description", content: "Market opportunity, business model, competitive analysis, roadmap, and investor ask for CivicOS — India's Citizen Operating System." },
      { property: "og:title", content: "CivicOS — Investor Pitch" },
      { property: "og:description", content: "A GovTech operating system for 1.4 billion citizens." },
    ],
  }),
  component: Pitch,
});

const competitors = [
  { name: "UMANG",      s: ["Aggregator app"],                w: ["Info only", "No AI", "Poor UX"] },
  { name: "CPGRAMS",    s: ["Official grievance portal"],     w: ["Single channel", "No drafting help"] },
  { name: "DigiLocker", s: ["Doc storage"],                   w: ["No workflow", "No assistant"] },
  { name: "Nyaaya",     s: ["Legal explainers"],              w: ["Content only", "No filing"] },
  { name: "NyayAI / Sanhita AI", s: ["Lawyer-facing"],        w: ["Not citizen-first", "English-heavy"] },
  { name: "CivicOS",    s: ["End-to-end AI OS", "22 languages", "Voice", "Tracker + escalation"], w: [] },
];

const revenue = [
  { t: "Freemium citizen tier", d: "Unlimited basic use; premium ₹99/mo for priority filing, docs pack, family accounts." },
  { t: "State government SaaS", d: "White-labelled deployment per state; per-citizen-served pricing." },
  { t: "Enterprise licensing", d: "HR platforms, banks, insurers embed CivicOS for their end users." },
  { t: "API services", d: "Scheme-eligibility API, RTI-drafting API, document-OCR API." },
  { t: "NGO partnerships", d: "Discounted seats for legal aid orgs; co-branded outreach." },
  { t: "Legal referral network", d: "Warm referrals to vetted lawyers for complex cases." },
  { t: "Data insights (aggregated)", d: "Anonymised civic-issue heatmaps sold to policy researchers under strict DPDP guardrails." },
];

const roadmap = [
  { phase: "MVP (0–6 mo)", items: ["AI assistant + Scheme finder + RTI generator", "Hindi + English + Tamil", "DigiLocker + CPGRAMS integration", "Web PWA"] },
  { phase: "V1 (6–18 mo)", items: ["All 8 modules live", "22 languages", "Android app", "State portal adapters (top 8 states)", "Voice-first flow", "Application Tracker with escalation"] },
  { phase: "V2 (18–36 mo)", items: ["State-government white-label", "Legal aid marketplace", "Proactive policy engine", "IVR + WhatsApp channels", "On-device Indic models for offline villages"] },
];

function Pitch() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <Badge variant="outline">Investor pitch</Badge>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">A GovTech OS for 1.4 billion citizens.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          India spent a decade building world-class digital public infrastructure — Aadhaar, UPI, DigiLocker, ONDC. But the citizen experience on top of it is still fragmented. CivicOS is the missing consumer layer: one AI assistant that turns any government intent into a completed outcome.
        </p>
      </div>

      {/* Market */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Market opportunity</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { n: "1.4B", l: "Total addressable population" },
            { n: "820M+", l: "Smartphone users (SAM)" },
            { n: "$4.2B", l: "GovTech + LegalTech India TAM by 2030" },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="text-4xl font-bold text-primary">{s.n}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Competitive */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Competitive landscape</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-semibold">Player</th>
                <th className="p-3 font-semibold">Strengths</th>
                <th className="p-3 font-semibold">Gaps</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr key={c.name} className={`border-t border-border/60 ${c.name === "CivicOS" ? "bg-primary/5" : ""}`}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">
                    <ul className="space-y-1">
                      {c.s.map((x) => <li key={x} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {x}</li>)}
                    </ul>
                  </td>
                  <td className="p-3">
                    <ul className="space-y-1 text-muted-foreground">
                      {c.w.map((x) => <li key={x} className="flex items-start gap-1.5"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {x}</li>)}
                      {c.w.length === 0 && <li className="text-muted-foreground/50">—</li>}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* USP */}
      <section className="mt-16 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-8 sm:p-10">
        <h2 className="text-2xl font-bold">The moat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            "AI workflow orchestration across 900+ portals",
            "Personalised citizen lifecycle memory",
            "Indic-first voice UX (22 languages)",
            "Proactive alerts tuned to each citizen's profile",
            "End-to-end task completion — not just information",
            "Deep DPI integration (DigiLocker, UMANG, e-Sign)",
          ].map((m) => (
            <div key={m} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="text-sm">{m}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Business model</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {revenue.map((r) => (
            <div key={r.t} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="font-semibold">{r.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{r.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Roadmap</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {roadmap.map((r) => (
            <div key={r.phase} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="text-sm font-mono text-accent">{r.phase}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {r.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Ask */}
      <section className="mt-16 rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
        <h2 className="text-2xl font-bold">The ask</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Seed round of <span className="font-semibold text-foreground">$2.5M</span> for 18 months of runway to ship V1, close 3 state-government pilots, and reach 5M monthly active citizens across Hindi + Tamil + Bengali belts.
        </p>
      </section>
    </div>
  );
}
