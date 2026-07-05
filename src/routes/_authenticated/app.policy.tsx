import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPolicyUpdates, type PolicyUpdate } from "@/lib/civic.functions";
import { saveModuleRun } from "@/lib/history.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BellRing, Loader2, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/policy")({
  head: () => ({ meta: [{ title: "Policy & Law Updates — CivicOS" }] }),
  component: PolicyPage,
});

const categoryColor: Record<PolicyUpdate["category"], string> = {
  Scheme: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Law: "bg-primary/10 text-primary border-primary/30",
  Notification: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "Court Order": "bg-chart-5/15 text-chart-5 border-chart-5/30",
  Deadline: "bg-accent/15 text-accent-foreground border-accent/40",
};

function PolicyPage() {
  const fn = useServerFn(getPolicyUpdates);
  const save = useServerFn(saveModuleRun);
  const [state, setState] = useState("Maharashtra");
  const [occupation, setOccupation] = useState("Small farmer");
  const [interests, setInterests] = useState("agriculture, subsidies, PM-KISAN, crop insurance");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<PolicyUpdate[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUpdates(null);
    try {
      const { updates } = await fn({ data: { state, occupation, interests, timeframe } });
      setUpdates(updates);
      if (updates.length === 0) toast.error("No updates generated. Try broader interests.");
      else void save({
        data: {
          module: "policy",
          title: `${state} · ${occupation || "citizen"} · ${timeframe} · ${updates.length} updates`,
          input: { state, occupation, interests, timeframe },
          output: { updates },
        },
      }).catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch updates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy & Law Update Engine</h1>
          <p className="text-sm text-muted-foreground">
            Personalised digest of recent schemes, laws, notifications, and deadlines.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interests">Interests / life areas</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. education, housing, GST, women's rights"
              required
            />
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as "7d" | "30d" | "90d")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Building your digest…
              </>
            ) : (
              "Generate personalised digest"
            )}
          </Button>
        </form>
      </Card>

      {updates && updates.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Your digest ({updates.length} updates)</h2>
          {updates.map((u, i) => (
            <Card key={i} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={categoryColor[u.category] ?? ""}>
                      {u.category}
                    </Badge>
                    {u.source && (
                      <span className="text-xs text-muted-foreground">Source: {u.source}</span>
                    )}
                    {u.date && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {u.date}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-semibold">{u.title}</h3>
                </div>
                {u.confidence && (
                  <Badge
                    variant={u.confidence === "high" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {u.confidence}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{u.summary}</p>
              {u.why_it_matters && (
                <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                  <span className="font-medium">Why it matters for you: </span>
                  {u.why_it_matters}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {u.action && (
                  <div className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{u.action}</span>
                  </div>
                )}
                {u.deadline && (
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Deadline: {u.deadline}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
