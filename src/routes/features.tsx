import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare, Sparkles, Scale, FileText, Building2, ClipboardList, LifeBuoy, BellRing, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — CivicOS" },
      { name: "description", content: "Eight AI-powered modules covering the full Indian citizen lifecycle: assistant, schemes, rights, complaints, department finder, tracker, legal aid, and alerts." },
      { property: "og:title", content: "CivicOS Features" },
      { property: "og:description", content: "Every government interaction, one AI assistant." },
    ],
  }),
  component: Features,
});

const features = [
  {
    icon: MessageSquare,
    title: "AI Citizen Assistant",
    tag: "Core",
    to: "/app/chat",
    body: "Multilingual, voice-first conversational agent. Uses intent detection to route citizens to the right module, retains context across sessions, and personalises based on profile (age, state, occupation, income band).",
    bullets: ["22 Indian languages", "Voice ⇄ text", "Persistent citizen memory", "Escalates to human when needed"],
  },
  {
    icon: Sparkles,
    title: "Government Scheme Eligibility",
    tag: "Discovery",
    to: "/app/schemes",
    body: "Continuously synced catalogue of Central and State schemes. Eligibility engine explains why a citizen qualifies, what documents are needed, and guides them through the actual application (via portal deep-link or generated form pack).",
    bullets: ["Central + State + District", "Plain-language eligibility", "Document checklist auto-generated", "Application deep-links"],
  },
  {
    icon: Scale,
    title: "Rights & Constitution Assistant",
    tag: "Empowerment",
    to: "/app/rights",
    body: "Explains fundamental rights, duties, and applicable laws with real-world examples. Clearly distinguishes legal information from legal advice and cross-links to the Legal Aid Finder for representation.",
    bullets: ["Constitution + BNS + IPC/CrPC transitions", "Case-example library", "Info-vs-advice guardrails", "Handoff to legal aid"],
  },
  {
    icon: FileText,
    title: "Smart Complaint Generator",
    tag: "Action",
    to: "/app/complaints",
    body: "Drafts RTIs, grievances, consumer complaints, police complaint drafts, and legal notices from a short description. Auto-fills jurisdiction, statutes, and evidence sections; exports as PDF or submits digitally where APIs exist.",
    bullets: ["RTI, CPGRAMS, consumer, legal notice", "Section/act auto-citation", "Multi-format export", "e-Sign integration"],
  },
  {
    icon: Building2,
    title: "Government Department Finder",
    tag: "Navigation",
    to: "/app/departments",
    body: "Given a problem, returns the correct department, office address, jurisdiction, contact channel, required forms, and prerequisites. Backed by a curated Central/State/ULB directory with weekly sync.",
    bullets: ["Central + State + Municipal", "Jurisdiction resolver", "Office maps + hours", "Form + document requirements"],
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    tag: "Follow-through",
    to: "/app/tracker",
    body: "Unified inbox for every application, RTI, and grievance filed via CivicOS. Automated status polling where APIs exist, manual check-in prompts otherwise, and one-tap escalation when statutory timelines lapse.",
    bullets: ["Unified status inbox", "Statutory deadline alarms", "One-tap escalation", "Auto-generated reminders"],
  },
  {
    icon: LifeBuoy,
    title: "Legal Aid Finder",
    tag: "Support",
    to: "/app/legal-aid",
    body: "Recommends NALSA-empanelled legal aid centres, state DLSA offices, women/child helplines, NGOs, and emergency contacts based on issue type and geography.",
    bullets: ["NALSA / DLSA directory", "Category-tuned NGO match", "Emergency helplines", "Offline-capable contact card"],
  },
  {
    icon: BellRing,
    title: "Policy & Law Update Engine",
    tag: "Proactive",
    to: "/app/policy",
    body: "Watches gazettes, PIB, court orders, and state notifications. Personalises alerts to each citizen's profile: 'A new scheme you're eligible for was launched today' or 'Deadline in 3 days'.",
    bullets: ["Gazette + PIB + court order ingest", "Profile-matched alerts", "Deadline countdowns", "Digest + push"],
  },
] as const;

function Features() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <Badge variant="outline">Features</Badge>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Eight modules. One citizen assistant.</h1>
        <p className="mt-4 text-muted-foreground">
          CivicOS covers the full citizen lifecycle — from discovering an entitlement to closing the loop with a grievance if it's denied.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="text-xs">{f.tag}</Badge>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            <ul className="mt-4 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
              {f.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
            <Button asChild size="sm" className="mt-6">
              <Link to={f.to}>
                Explore now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
