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
    inputs: ["Free-text question (any Indian language)", "Optional profile: state, age, occupation"],
    how: "Understands the intent, pulls relevant scheme / act / portal knowledge, and replies in plain language with step-by-step next actions and portal names.",
  },
  {
    icon: Sparkles,
    title: "Government Scheme Eligibility",
    tag: "Discovery",
    to: "/app/schemes",
    body: "Continuously synced catalogue of Central and State schemes. Eligibility engine explains why a citizen qualifies, what documents are needed, and guides them through the actual application (via portal deep-link or generated form pack).",
    bullets: ["Central + State + District", "Plain-language eligibility", "Document checklist auto-generated", "Application deep-links"],
    inputs: ["State", "Age & gender", "Occupation", "Annual household income", "Social category (optional)"],
    how: "Matches the profile against Central + State welfare schemes and returns 6 best-fit schemes with eligibility, benefit, how to apply, and a confidence rating.",
  },
  {
    icon: Scale,
    title: "Rights & Constitution Assistant",
    tag: "Empowerment",
    to: "/app/rights",
    body: "Explains fundamental rights, duties, and applicable laws with real-world examples. Clearly distinguishes legal information from legal advice and cross-links to the Legal Aid Finder for representation.",
    bullets: ["Constitution + BNS + IPC/CrPC transitions", "Case-example library", "Info-vs-advice guardrails", "Handoff to legal aid"],
    inputs: ["Describe your situation", "Your role (tenant, employee, woman, etc.)", "State (optional)"],
    how: "Returns a plain-language summary, the exact constitutional articles / BNS / act sections that apply, a realistic example, concrete next steps, and an escalation path.",
  },
  {
    icon: FileText,
    title: "Smart Complaint Generator",
    tag: "Action",
    to: "/app/complaints",
    body: "Drafts RTIs, grievances, consumer complaints, police complaint drafts, and legal notices from a short description. Auto-fills jurisdiction, statutes, and evidence sections; exports as PDF or submits digitally where APIs exist.",
    bullets: ["RTI, CPGRAMS, consumer, legal notice", "Section/act auto-citation", "Multi-format export", "e-Sign integration"],
    inputs: ["Kind: RTI or complaint", "Your name & address", "Target authority", "Subject", "Details of the issue", "Language: English / Hindi"],
    how: "Drafts a formal, ready-to-send letter in the correct format — RTI Act 2005 structure for RTIs, standard grievance format for complaints — under 400 words.",
  },
  {
    icon: Building2,
    title: "Government Department Finder",
    tag: "Navigation",
    to: "/app/departments",
    body: "Given a problem, returns the correct department, office address, jurisdiction, contact channel, required forms, and prerequisites. Backed by a curated Central/State/ULB directory with weekly sync.",
    bullets: ["Central + State + Municipal", "Jurisdiction resolver", "Office maps + hours", "Form + document requirements"],
    inputs: ["Describe the problem", "State", "City (optional)"],
    how: "Returns 3-4 relevant offices (Central / State / District / Municipal) with jurisdiction, address guidance, forms, documents, and a 1-2 sentence action plan.",
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    tag: "Follow-through",
    to: "/app/tracker",
    body: "Unified inbox for every application, RTI, and grievance filed via CivicOS. Automated status polling where APIs exist, manual check-in prompts otherwise, and one-tap escalation when statutory timelines lapse.",
    bullets: ["Unified status inbox", "Statutory deadline alarms", "One-tap escalation", "Auto-generated reminders"],
    inputs: ["Application type", "Authority", "Date filed", "Reference ID (optional)", "Last known update (optional)"],
    how: "Estimates the likely current stage, marks it On track / Delayed / Action needed, shows the statutory timeline, your next step, and the escalation path if a deadline has lapsed.",
  },
  {
    icon: LifeBuoy,
    title: "Legal Aid Finder",
    tag: "Support",
    to: "/app/legal-aid",
    body: "Recommends NALSA-empanelled legal aid centres, state DLSA offices, women/child helplines, NGOs, and emergency contacts based on issue type and geography.",
    bullets: ["NALSA / DLSA directory", "Category-tuned NGO match", "Emergency helplines", "Offline-capable contact card"],
    inputs: ["Describe the issue", "State & city", "Urgency: emergency / urgent / normal"],
    how: "Returns 4-6 matched contacts across NALSA, State DLSA, national helplines (112, 181, 1098…), NGOs, and emergency numbers — ordered by urgency, with when-to-use notes.",
  },
  {
    icon: BellRing,
    title: "Policy & Law Update Engine",
    tag: "Proactive",
    to: "/app/policy",
    body: "Watches gazettes, PIB, court orders, and state notifications. Personalises alerts to each citizen's profile: 'A new scheme you're eligible for was launched today' or 'Deadline in 3 days'.",
    bullets: ["Gazette + PIB + court order ingest", "Profile-matched alerts", "Deadline countdowns", "Digest + push"],
    inputs: ["State", "Occupation", "Interests / life areas", "Timeframe: 7 / 30 / 90 days"],
    how: "Builds a 5-7 item personalised digest of recent schemes, laws, notifications and court orders — each with why-it-matters-for-you, action, and deadline countdown.",
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
