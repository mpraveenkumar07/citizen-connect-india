import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ModuleKey =
  | "schemes"
  | "complaints"
  | "departments"
  | "policy"
  | "rights"
  | "tracker"
  | "legal-aid";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export type ModuleRun = {
  id: string;
  module: ModuleKey;
  title: string;
  input: JsonValue;
  output: JsonValue;
  created_at: string;
};

const MODULES = [
  "schemes", "complaints", "departments", "policy", "rights", "tracker", "legal-aid",
] as const;

export const saveModuleRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      module: z.enum(MODULES),
      title: z.string().min(1).max(200),
      input: z.any(),
      output: z.any(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("module_runs")
      .insert({
        user_id: context.userId,
        module: data.module,
        title: data.title,
        input: data.input as never,
        output: data.output as never,
      })
      .select("id")
      .single();
    if (error) throw new Error("Failed to save run: " + error.message);
    return { id: row.id as string };
  });

export const listModuleRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      module: z.enum(MODULES).optional(),
      limit: z.number().int().min(1).max(200).default(100),
    }).parse(d ?? {})
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("module_runs")
      .select("id, module, title, input, output, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.module) query = query.eq("module", data.module);
    const { data: rows, error } = await query;
    if (error) throw new Error("Failed to load history: " + error.message);
    return { runs: (rows ?? []) as ModuleRun[] };
  });

export const deleteModuleRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("module_runs")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Failed to delete: " + error.message);
    return { ok: true };
  });
