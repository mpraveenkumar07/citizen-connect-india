import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, FileText, Search, Building2, BellRing, Scale, ClipboardList, LifeBuoy, History } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "CivicOS — Dashboard" }] }),
  component: Dashboard,
});

const tiles = [
  {
    to: "/app/chat",
    icon: MessageSquare,
    title: "AI Citizen Assistant",
    desc: "Ask anything about schemes, rights, RTI, taxes, documents. Answers in your language.",
  },
  {
    to: "/app/schemes",
    icon: Search,
    title: "Scheme Eligibility Finder",
    desc: "Tell us about yourself. AI matches you to central & state welfare schemes.",
  },
  {
    to: "/app/rights",
    icon: Scale,
    title: "Rights & Constitution",
    desc: "Understand which rights, articles, and laws apply to your situation.",
  },
  {
    to: "/app/complaints",
    icon: FileText,
    title: "Complaint & RTI Generator",
    desc: "Draft a formal complaint or RTI application in seconds — ready to send.",
  },
  {
    to: "/app/departments",
    icon: Building2,
    title: "Government Department Finder",
    desc: "Describe a problem — get the right office, forms, contact, and next steps.",
  },
  {
    to: "/app/tracker",
    icon: ClipboardList,
    title: "Application Tracker",
    desc: "Estimate current stage, statutory deadlines, and your next move.",
  },
  {
    to: "/app/legal-aid",
    icon: LifeBuoy,
    title: "Legal Aid Finder",
    desc: "NALSA / DLSA offices, helplines, NGOs, and emergency contacts near you.",
  },
  {
    to: "/app/policy",
    icon: BellRing,
    title: "Policy & Law Update Engine",
    desc: "Personalised digest of new schemes, laws, notifications, and upcoming deadlines.",
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Your CivicOS workspace</h1>
      <p className="mt-2 text-muted-foreground">Pick a tool to get started.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">

        {tiles.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="group h-full p-6 transition-all hover:border-primary hover:shadow-lg">
              <t.icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                Open →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
