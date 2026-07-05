import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { explainRights, type RightsAnswer } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Scale, Loader2, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/rights")({
  head: () => ({ meta: [{ title: "Rights & Constitution — CivicOS" }] }),
  component: RightsPage,
});

function RightsPage() {
  const fn = useServerFn(explainRights);
  const [situation, setSituation] = useState(
    "The police refused to file my FIR when I went to the station last night."
  );
  const [role, setRole] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<RightsAnswer | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);
    try {
      const { answer } = await fn({ data: { situation, role, state } });
      setAnswer(answer);
      if (!answer) toast.error("Couldn't parse the response. Try rephrasing your situation.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to explain rights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rights & Constitution Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Understand which rights, articles, and laws apply to your situation — in plain language.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="situation">Describe your situation</Label>
            <Textarea
              id="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="role">Your role (optional)</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. tenant, employee, student, woman, senior citizen"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State (optional)</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing your rights…
              </>
            ) : (
              "Explain my rights"
            )}
          </Button>
        </form>
      </Card>

      {answer && (
        <div className="mt-8 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-2 text-sm text-muted-foreground">{answer.summary}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Applicable rights</h2>
            <div className="mt-4 space-y-4">
              {answer.rights.map((r, i) => (
                <div key={i} className="border-l-2 border-primary/40 pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                    {r.article_or_law && (
                      <Badge variant="outline" className="text-xs">
                        {r.article_or_law}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.explanation}</p>
                </div>
              ))}
            </div>
          </Card>

          {answer.example && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Example</h2>
              <p className="mt-2 text-sm text-muted-foreground">{answer.example}</p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-semibold">What you can do</h2>
            <ul className="mt-3 space-y-2">
              {answer.what_you_can_do.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            {answer.escalation && (
              <p className="mt-4 rounded-md bg-muted p-3 text-sm">
                <span className="font-medium">If that doesn't work: </span>
                {answer.escalation}
              </p>
            )}
          </Card>

          <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{answer.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
