import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Mic,
  Sparkles,
  Scale,
  FileText,
  Building2,
  ClipboardList,
  LifeBuoy,
  BellRing,
  MessageSquare,
  Shield,
  Languages,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Home,
});

const modules = [
  { icon: MessageSquare, title: "AI Citizen Assistant", desc: "Chat or speak in your language. One doorway to every service." },
  { icon: Sparkles, title: "Scheme Eligibility", desc: "Discover Central + State schemes you actually qualify for." },
  { icon: Scale, title: "Rights & Constitution", desc: "Your fundamental rights, duties, and remedies in plain words." },
  { icon: FileText, title: "Smart Complaint Generator", desc: "RTIs, grievances, legal notices, and applications — drafted for you." },
  { icon: Building2, title: "Department Finder", desc: "The right office, the right form, the right next step." },
  { icon: ClipboardList, title: "Application Tracker", desc: "Live status, escalation timers, and reminders in one inbox." },
  { icon: LifeBuoy, title: "Legal Aid Finder", desc: "Nearby aid centres, NGOs, helplines, and emergency contacts." },
  { icon: BellRing, title: "Policy & Law Updates", desc: "Personalised alerts on new schemes, laws, and deadlines." },
] as const;

const examples = [
  "I lost my Aadhaar card.",
  "My employer isn't paying my salary.",
  "I want to start a small business.",
  "My pension application is delayed.",
  "My landlord isn't returning my deposit.",
  "The road in my colony hasn't been repaired.",
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/12%),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Concept · Built for 1.4 billion citizens
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                India's Citizen <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Operating System</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Describe your problem in your own words. CivicOS finds the scheme, drafts the paperwork, files it with the right department, and follows up — end to end.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/features">
                    Explore features <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pitch">Read the pitch</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Languages className="h-4 w-4" /> 22 languages</span>
                <span className="flex items-center gap-1.5"><Mic className="h-4 w-4" /> Voice first</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> DPDP-aligned</span>
                <span className="flex items-center gap-1.5"><Accessibility className="h-4 w-4" /> Accessible by default</span>
              </div>
            </div>

            {/* Chat mock */}
            <div className="relative">
              <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-2xl shadow-primary/5 sm:p-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">CivicOS Assistant</div>
                      <div className="text-xs text-muted-foreground">Hindi · English · Voice ready</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                    My mother's widow pension hasn't come for 4 months.
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="font-medium">Here's what I can do 👇</div>
                    <ul className="mt-2 space-y-1.5 text-muted-foreground">
                      <li>• Verify her Indira Gandhi National Widow Pension Scheme (IGNWPS) status</li>
                      <li>• Draft a grievance to the State Social Welfare Dept.</li>
                      <li>• File an RTI on payment delay if unresolved in 15 days</li>
                    </ul>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary">Start</Button>
                      <Button size="sm" variant="ghost">Speak instead</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-accent/20 blur-2xl sm:block" />
              <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="outline">The problem</Badge>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Government works. Access doesn't.</h2>
            <p className="mt-4 text-muted-foreground">
              Services exist. Rights exist. Schemes exist. But they're scattered across 900+ portals, 28 states, and languages most people don't read. Citizens give up long before they get served.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "950+", l: "Government portals a citizen may need to navigate" },
              { n: "60%", l: "of eligible beneficiaries never claim central schemes" },
              { n: "22", l: "official languages — most portals support only 2" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="text-4xl font-bold text-primary">{s.n}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline">The solution</Badge>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Describe your problem. We handle the rest.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              An AI orchestration layer that turns natural-language intent into a completed government transaction.
            </p>
          </div>
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
            {examples.map((ex) => (
              <span key={ex} className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground">
                "{ex}"
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Modules bento */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge variant="outline">Eight modules, one assistant</Badge>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The full citizen lifecycle.</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/features">Feature deep-dive <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <div key={m.title} className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{m.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="outline">How it works</Badge>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Three steps from intent to outcome.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Speak or type", d: "In any of 22 Indian languages, describe what you need." },
              { n: "02", t: "AI orchestrates", d: "Intent detection → scheme match → document check → draft generation → submission." },
              { n: "03", t: "Track to closure", d: "Automated status polling, escalation, and grievance if deadlines slip." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="text-sm font-mono text-accent">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Be part of the first Citizen OS.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Whether you're a citizen, a state agency, an NGO, or an investor — CivicOS is designed to be adopted at scale from day one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild><Link to="/pitch">See the pitch <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/architecture">Technical architecture</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
