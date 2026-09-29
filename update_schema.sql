-- 1. Add assigned_branch_id to inquiries table
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS assigned_branch_id UUID REFERENCES public.branches(id);

-- 2. Update branches table (Ensure manager_name and email exist)
-- These are already in the base schema, but we'll ensure they are there
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branches' AND column_name='manager_name') THEN
        ALTER TABLE public.branches ADD COLUMN manager_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branches' AND column_name='email') THEN
        ALTER TABLE public.branches ADD COLUMN email TEXT;
    END IF;
END $$;

-- 3. Existing branches are intentionally preserved.
-- Never truncate production data from a schema migration.

-- 4. Insert branches from Excel data
-- (This part is better done via the seed script if RLS is off, or we can generate INSERT statements)
-- I will provide a separate seed script that the user can run with their SERVICE_ROLE_KEY or I will generate the SQL here.
