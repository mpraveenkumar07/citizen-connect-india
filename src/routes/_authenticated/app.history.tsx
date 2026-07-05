import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { deleteModuleRun, listModuleRuns, type ModuleKey, type ModuleRun } from "@/lib/history.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  History as HistoryIcon,
  Loader2,
  Trash2,
  MessageSquare,
  FileText,
  Search,
  Building2,
  BellRing,
  Scale,
  ClipboardList,
  LifeBuoy,
  Columns2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/history")({
  head: () => ({ meta: [{ title: "History — CivicOS" }] }),
  component: HistoryPage,
});

const MODULE_META: Record<
  ModuleKey,
  { label: string; icon: typeof MessageSquare; color: string }
> = {
  schemes: { label: "Schemes", icon: Search, color: "text-primary" },
  rights: { label: "Rights", icon: Scale, color: "text-chart-3" },
  complaints: { label: "Complaints / RTI", icon: FileText, color: "text-chart-4" },
  departments: { label: "Departments", icon: Building2, color: "text-chart-5" },
  tracker: { label: "Application Tracker", icon: ClipboardList, color: "text-primary" },
  "legal-aid": { label: "Legal Aid", icon: LifeBuoy, color: "text-destructive" },
  policy: { label: "Policy Updates", icon: BellRing, color: "text-accent-foreground" },
};

function HistoryPage() {
  const list = useServerFn(listModuleRuns);
  const del = useServerFn(deleteModuleRun);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<ModuleRun[]>([]);
  const [filter, setFilter] = useState<ModuleKey | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { runs } = await list({ data: {} });
      setRuns(runs);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => (filter === "all" ? runs : runs.filter((r) => r.module === filter)),
    [runs, filter]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedRuns = selectedIds
    .map((id) => runs.find((r) => r.id === id))
    .filter((r): r is ModuleRun => Boolean(r));

  const canCompare =
    selectedRuns.length === 2 && selectedRuns[0].module === selectedRuns[1].module;

  const removeRun = async (id: string) => {
    try {
      await del({ data: { id } });
      setRuns((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HistoryIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground">
              Your saved inputs and outputs across every module. Select two runs of the same module to compare side-by-side.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => {
              setFilter(v as ModuleKey | "all");
              setSelectedIds([]);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {(Object.keys(MODULE_META) as ModuleKey[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {MODULE_META[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedRuns.length > 0 && (
        <Card className="mt-6 border-primary/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-medium">{selectedRuns.length}/2 selected</span>
              {selectedRuns.length === 2 && !canCompare && (
                <span className="ml-2 text-destructive">
                  Pick two runs from the same module to compare.
                </span>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
              Clear selection
            </Button>
          </div>
        </Card>
      )}

      {canCompare && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {selectedRuns.map((r) => (
            <CompareCard key={r.id} run={r} />
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            <p className="mt-2">Loading your history…</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No saved runs yet. Use any tool and its input & output will be saved here automatically.
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <RunRow
                key={r.id}
                run={r}
                selected={selectedIds.includes(r.id)}
                onToggle={() => toggleSelect(r.id)}
                onDelete={() => removeRun(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RunRow({
  run,
  selected,
  onToggle,
  onDelete,
}: {
  run: ModuleRun;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const meta = MODULE_META[run.module];
  const Icon = meta.icon;
  return (
    <Card
      className={`p-4 transition-colors ${
        selected ? "border-primary ring-1 ring-primary/40" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon className={`h-4 w-4 ${meta.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {meta.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(run.created_at).toLocaleString()}
              </span>
            </div>
            <h3 className="mt-1 text-sm font-medium">{run.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={selected ? "default" : "outline"}
            onClick={onToggle}
          >
            <Columns2 className="h-4 w-4" />
            {selected ? "Selected" : "Compare"}
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CompareCard({ run }: { run: ModuleRun }) {
  const meta = MODULE_META[run.module];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{meta.label}</Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(run.created_at).toLocaleString()}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold">{run.title}</h3>

      <div className="mt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Input
        </div>
        <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(run.input, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Output
        </div>
        <pre className="mt-1 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(run.output, null, 2)}
        </pre>
      </div>
    </Card>
  );
}
