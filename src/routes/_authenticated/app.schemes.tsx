import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { findSchemes } from "@/lib/civic.functions";
import { saveModuleRun } from "@/lib/history.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/schemes")({
  head: () => ({ meta: [{ title: "Scheme Eligibility Finder — CivicOS" }] }),
  component: Page,
});

type Scheme = {
  name: string;
  department?: string;
  eligibility?: string;
  benefit?: string;
  how_to_apply?: string;
  confidence?: string;
};

function Page() {
  const fn = useServerFn(findSchemes);
  const save = useServerFn(saveModuleRun);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [form, setForm] = useState({
    state: "",
    age: 30,
    gender: "Female",
    occupation: "",
    annualIncome: 100000,
    category: "General",
    extra: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fn({ data: form });
      setSchemes(res.schemes as Scheme[]);
      void save({
        data: {
          module: "schemes",
          title: `${form.occupation || "Citizen"} in ${form.state || "India"} · ${res.schemes.length} matches`,
          input: form,
          output: res,
        },
      }).catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Scheme Eligibility Finder</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us about yourself. Our AI matches you to central and state welfare schemes.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[380px_1fr]">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>State</Label>
              <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Maharashtra" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Age</Label>
                <Input required type="number" value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Occupation</Label>
              <Input required value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Farmer, student, small business…" />
            </div>
            <div>
              <Label>Annual household income (₹)</Label>
              <Input required type="number" value={form.annualIncome} onChange={(e) => setForm({ ...form, annualIncome: +e.target.value })} />
            </div>
            <div>
              <Label>Social category</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>EWS</option>
                <option>Minority</option>
              </select>
            </div>
            <div>
              <Label>Anything else? (disability, single-parent, farmer type…)</Label>
              <Textarea rows={2} value={form.extra} onChange={(e) => setForm({ ...form, extra: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="mr-2 h-4 w-4" /> Find schemes</>}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {!schemes && !loading && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              Your matched schemes will appear here.
            </Card>
          )}
          {loading && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              <p className="mt-2">Analyzing eligibility…</p>
            </Card>
          )}
          {schemes?.map((s, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold">{s.name}</h3>
                {s.confidence && (
                  <Badge variant={s.confidence === "high" ? "default" : "secondary"}>
                    {s.confidence}
                  </Badge>
                )}
              </div>
              {s.department && <p className="mt-1 text-xs text-muted-foreground">{s.department}</p>}
              {s.benefit && <p className="mt-3 text-sm"><span className="font-medium">Benefit:</span> {s.benefit}</p>}
              {s.eligibility && <p className="mt-1 text-sm"><span className="font-medium">Eligibility:</span> {s.eligibility}</p>}
              {s.how_to_apply && <p className="mt-1 text-sm"><span className="font-medium">How to apply:</span> {s.how_to_apply}</p>}
            </Card>
          ))}
          {schemes && schemes.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No schemes matched. Try adjusting your profile.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
