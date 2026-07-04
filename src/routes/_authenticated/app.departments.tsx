import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { findDepartment, type Department } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, MapPin, Phone, Globe, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/departments")({
  head: () => ({ meta: [{ title: "Government Department Finder — CivicOS" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const fn = useServerFn(findDepartment);
  const [problem, setProblem] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Department[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const { departments } = await fn({ data: { problem, state, city } });
      setResults(departments);
      if (departments.length === 0) toast.error("No departments found. Try rephrasing your problem.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to find department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Government Department Finder</h1>
          <p className="text-sm text-muted-foreground">
            Describe your problem — we'll point you to the right office, forms, and next steps.
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="problem">What is the problem?</Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Streetlight in front of my house has been broken for 2 weeks."
              rows={3}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City / District (optional)</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Finding departments…
              </>
            ) : (
              "Find the right department"
            )}
          </Button>
        </form>
      </Card>

      {results && results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Recommended offices</h2>
          {results.map((d, i) => (
            <Card key={i} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{d.name}</h3>
                  {d.jurisdiction && (
                    <p className="text-sm text-muted-foreground">{d.jurisdiction}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{d.level}</Badge>
                  {d.confidence && (
                    <Badge
                      variant={d.confidence === "high" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {d.confidence}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {d.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{d.address}</span>
                  </div>
                )}
                {d.contact && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{d.contact}</span>
                  </div>
                )}
                {d.website && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={d.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {d.website}
                    </a>
                  </div>
                )}
              </div>
              {(d.forms || d.documents) && (
                <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                  {d.forms && (
                    <p>
                      <span className="font-medium">Form:</span> {d.forms}
                    </p>
                  )}
                  {d.documents && (
                    <p className="mt-1">
                      <span className="font-medium">Documents:</span> {d.documents}
                    </p>
                  )}
                </div>
              )}
              {d.next_steps && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{d.next_steps}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
