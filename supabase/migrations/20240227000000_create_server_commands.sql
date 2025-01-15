-- Create the server_commands table
CREATE TABLE IF NOT EXISTS public.server_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES public.servers(id),
    command TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    output TEXT,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.server_commands ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Commands are viewable by authenticated users"
ON public.server_commands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Commands are insertable by authenticated users"
ON public.server_commands
FOR INSERT
TO authenticated
WITH CHECK (true);