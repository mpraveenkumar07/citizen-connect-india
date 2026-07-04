import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/journeys")({
  head: () => ({
    meta: [
      { title: "User Journeys — CivicOS" },
      { name: "description", content: "Step-by-step citizen journeys through CivicOS: filing an RTI, finding a scheme, filing a grievance, understanding rights, tracking an application, and finding legal aid." },
      { property: "og:title", content: "CivicOS User Journeys" },
      { property: "og:description", content: "From intent to outcome — six real citizen flows." },
    ],
  }),
  component: Journeys,
});

const journeys = [
  {
    id: "rti",
    label: "File an RTI",
    persona: "Ravi, 34, Bengaluru — wants BBMP road repair records",
    steps: [
      "Ravi says: 'I want to know why the road repair in my area is delayed.'",
      "CivicOS classifies intent as RTI + Municipal, resolves jurisdiction (BBMP Ward 150).",
      "It asks 3 clarifying questions: ward, project reference, timeframe.",
      "Draft RTI generated in Kannada + English with correct PIO addressed.",
      "Payment of ₹10 fee handled inline; e-signature attached.",
      "Filed via state RTI portal; acknowledgement stored in Tracker.",
      "Day 30 alarm auto-set. If unanswered, first-appeal draft prepared.",
    ],
  },
  {
    id: "scheme",
    label: "Find a scheme",
    persona: "Sunita, 52, Bhopal — recently widowed",
    steps: [
      "Sunita speaks in Hindi: 'Mere pati guzar gaye. Koi madad milegi?'",
      "Empathetic response + tactful profiling: age, state, income, dependents.",
      "Eligibility engine matches IGNWPS, MP state widow pension, PMJDY insurance claim.",
      "Document checklist generated; missing docs flagged.",
      "DigiLocker pulls Aadhaar + ration card with consent.",
      "Application pre-filled; guided submission via state portal deep-link.",
      "Case added to Tracker with expected disbursal timeline.",
    ],
  },
  {
    id: "grievance",
    label: "File a grievance",
    persona: "Arjun, 28, Pune — pension not disbursed",
    steps: [
      "Types: 'My father's pension is 4 months late.'",
      "CivicOS identifies scheme (EPS-95), verifies via UAN if consented.",
      "Grievance drafted for EPFO; auto-cites relevant circulars.",
      "Submitted via EPFiGMS portal; ticket ID captured.",
      "20-day timer set. On lapse: escalation to Regional PF Commissioner.",
      "Parallel RTI drafted if second escalation is ignored.",
    ],
  },
  {
    id: "rights",
    label: "Understand rights",
    persona: "Meera, 22, Kolkata — stopped at a night checkpoint",
    steps: [
      "Voice query: 'Police stopped me at night. What are my rights?'",
      "CivicOS explains Article 22, arrest procedures (BNSS ss.35, 47), women-specific safeguards.",
      "Presents scripted phrases she can use verbatim.",
      "Offers one-tap SOS to a trusted contact + nearest legal aid centre.",
      "Marks 'Info, not legal advice' and links to DLSA if she wants representation.",
    ],
  },
  {
    id: "track",
    label: "Track applications",
    persona: "Vikram, 40, Chennai — juggling 3 open cases",
    steps: [
      "Unified inbox shows: passport renewal, GST refund, RTI to TNEB.",
      "Each card shows portal, ticket ID, days remaining vs statutory limit.",
      "Passport moves to 'Police verification pending' — CivicOS explains next step.",
      "GST refund breaches 60-day limit — one-tap grievance auto-generated.",
      "RTI answered — CivicOS summarises the 40-page reply in 5 bullets.",
    ],
  },
  {
    id: "legal",
    label: "Find legal aid",
    persona: "Farhan, 26, Delhi — landlord not returning deposit",
    steps: [
      "Describes issue in Urdu.",
      "CivicOS classifies as consumer/tenancy dispute in Delhi.",
      "Offers 3 paths: (1) demand notice draft, (2) consumer complaint, (3) free DLSA counsel.",
      "Draft demand notice generated with 15-day compliance window.",
      "Nearest DLSA branch + timings + phone number surfaced with map.",
      "If unresolved, auto-prepared consumer complaint bundle ready to file.",
    ],
  },
];

function Journeys() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <Badge variant="outline">User journeys</Badge>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Six citizens. Six outcomes.</h1>
        <p className="mt-4 text-muted-foreground">
          Every journey ends in a completed action, not just an answer.
        </p>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="rti">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
            {journeys.map((j) => (
              <TabsTrigger key={j.id} value={j.id} className="text-xs sm:text-sm">
                {j.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {journeys.map((j) => (
            <TabsContent key={j.id} value={j.id} className="mt-6">
              <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
                <div className="text-sm text-muted-foreground">Persona</div>
                <div className="mt-1 text-lg font-semibold">{j.persona}</div>
                <ol className="mt-6 space-y-4">
                  {j.steps.map((s, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {i + 1}
                      </div>
                      <div className="pt-1 text-sm leading-relaxed">{s}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
