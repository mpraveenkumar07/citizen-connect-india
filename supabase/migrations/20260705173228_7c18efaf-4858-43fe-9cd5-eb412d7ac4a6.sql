
CREATE TABLE public.module_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX module_runs_user_module_idx ON public.module_runs (user_id, module, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_runs TO authenticated;
GRANT ALL ON public.module_runs TO service_role;

ALTER TABLE public.module_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own runs" ON public.module_runs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
