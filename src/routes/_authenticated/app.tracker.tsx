import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackApplication, type TrackerStatus } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2, ArrowRight, AlertCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/tracker")({
  head: () => ({ meta: [{ title: "Application Tracker — CivicOS" }] }),
  component: TrackerPage,
});

const statusColor: Record<TrackerStatus["status"], string> = {
  "On track": "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Delayed: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "Action needed": "bg-destructive/15 text-destructive border-destructive/30",
  Closed: "bg-muted text-muted-foreground border-border",
};

function TrackerPage() {
  const fn = useServerFn(trackApplication);
  const [applicationType, setApplicationType] = useState("RTI application");
  const [authority, setAuthority] = useState("Public Information Officer, District Collectorate");
  const [filedOn, setFiledOn] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TrackerStatus | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { status } = await fn({
        data: { applicationType, authority, filedOn, referenceId, lastUpdate },
      });
      setStatus(status);
      if (!status) toast.error("Couldn't parse status. Try adding more detail.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to track application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Estimate current stage, statutory deadlines, and your next move.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="type">Application type</Label>
              <Input
                id="type"
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value)}
                placeholder="e.g. RTI, passport, ration card, PM-KISAN"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authority">Authority</Label>
              <Input
                id="authority"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="filed">Filed on</Label>
              <Input
                id="filed"
                type="date"
                value={filedOn}
                onChange={(e) => setFiledOn(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ref">Reference ID (optional)</Label>
              <Input
                id="ref"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last">Last known update (optional)</Label>
            <Textarea
              id="last"
              value={lastUpdate}
              onChange={(e) => setLastUpdate(e.target.value)}
              rows={2}
              placeholder="e.g. Received acknowledgement number, no reply since."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking status…
              </>
            ) : (
              "Estimate status"
            )}
          </Button>
        </form>
      </Card>

      {status && (
        <Card className="mt-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{status.stage}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Typical timeline: {status.typical_timeline}
              </p>
            </div>
            <Badge variant="outline" className={statusColor[status.status] ?? ""}>
              {status.status}
            </Badge>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-md bg-muted p-4 text-sm">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <div className="font-medium">Your next step</div>
              <p className="mt-1 text-muted-foreground">{status.next_step}</p>
            </div>
          </div>

          {status.deadline_note && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{status.deadline_note}</span>
            </div>
          )}

          {status.escalation_path && (
            <div className="mt-3 rounded-md border border-border/60 p-3 text-sm">
              <span className="font-medium">Escalation path: </span>
              <span className="text-muted-foreground">{status.escalation_path}</span>
            </div>
          )}

          {status.helpline && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{status.helpline}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
