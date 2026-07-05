import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { findLegalAid, type LegalAidContact } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Loader2, Phone, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/legal-aid")({
  head: () => ({ meta: [{ title: "Legal Aid Finder — CivicOS" }] }),
  component: LegalAidPage,
});

const typeColor: Record<LegalAidContact["type"], string> = {
  NALSA: "bg-primary/10 text-primary border-primary/30",
  "State DLSA": "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Helpline: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  NGO: "bg-accent/15 text-accent-foreground border-accent/40",
  Emergency: "bg-destructive/15 text-destructive border-destructive/30",
};

function LegalAidPage() {
  const fn = useServerFn(findLegalAid);
  const [issue, setIssue] = useState("Domestic violence — I need urgent help and a place to stay tonight.");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Pune");
  const [urgency, setUrgency] = useState<"emergency" | "urgent" | "normal">("urgent");
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<LegalAidContact[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContacts(null);
    try {
      const { contacts } = await fn({ data: { issue, state, city, urgency } });
      setContacts(contacts);
      if (contacts.length === 0) toast.error("No contacts generated. Try rephrasing.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to find legal aid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Legal Aid Finder</h1>
          <p className="text-sm text-muted-foreground">
            NALSA / DLSA offices, helplines, NGOs, and emergency contacts — matched to your issue.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="issue">What's the issue?</Label>
            <Textarea
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City / district</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Urgency</Label>
              <Select
                value={urgency}
                onValueChange={(v) => setUrgency(v as "emergency" | "urgent" | "normal")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Finding help…
              </>
            ) : (
              "Find legal aid"
            )}
          </Button>
        </form>
      </Card>

      {contacts && contacts.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {contacts.map((c, i) => (
            <Card key={i} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <Badge variant="outline" className={typeColor[c.type] ?? ""}>
                  {c.type}
                </Badge>
              </div>
              {c.scope && <p className="mt-1 text-sm text-muted-foreground">{c.scope}</p>}
              <div className="mt-3 space-y-1.5 text-sm">
                {c.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{c.contact}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{c.address}</span>
                  </div>
                )}
                {c.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{c.website}</span>
                  </div>
                )}
              </div>
              {c.when_to_use && (
                <p className="mt-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                  <span className="font-medium">When to use: </span>
                  {c.when_to_use}
                </p>
              )}
              {c.free && (
                <Badge variant="secondary" className="mt-3 text-xs">
                  Free service
                </Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
