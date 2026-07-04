import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateComplaint } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/complaints")({
  head: () => ({ meta: [{ title: "Complaint & RTI Generator — CivicOS" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(generateComplaint);
  const [kind, setKind] = useState<"complaint" | "rti">("complaint");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    authority: "",
    subject: "",
    details: "",
    language: "English" as "English" | "Hindi",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);
    try {
      const res = await fn({ data: { ...form, kind } });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Complaint & RTI Generator</h1>
      <p className="mt-2 text-muted-foreground">
        Fill the form. AI drafts a formal letter you can send.
      </p>

      <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)} className="mt-6">
        <TabsList>
          <TabsTrigger value="complaint">Grievance / Complaint</TabsTrigger>
          <TabsTrigger value="rti">RTI Application</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6 grid gap-6 md:grid-cols-[420px_1fr]">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Your full name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Your address</Label>
              <Textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>Authority / Department</Label>
              <Input required value={form.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} placeholder="e.g. Municipal Corporation of Delhi" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={kind === "rti" ? "Information sought about…" : "Complaint regarding…"} />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea required rows={5} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Describe the issue or the information you're seeking." />
            </div>
            <div>
              <Label>Language</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value as "English" | "Hindi" })}
              >
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Generate ${kind === "rti" ? "RTI" : "Complaint"}`}
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col p-6">
          {!output && !loading && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Your drafted letter will appear here.
            </div>
          )}
          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {output && (
            <>
              <div className="mb-3 flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={copy}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={download}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
              <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm leading-relaxed">
                {output}
              </pre>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
