-- Add a dedicated mobile column to interviews.
-- Safe to run multiple times.
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS mobile text;

-- Optional backfill from existing columns so historical records keep phone data.
UPDATE public.interviews
SET mobile = COALESCE(NULLIF(trim(phone), ''), NULLIF(trim(mobile_no), ''))
WHERE (mobile IS NULL OR trim(mobile) = '')
  AND (
    (phone IS NOT NULL AND trim(phone) <> '')
    OR (mobile_no IS NOT NULL AND trim(mobile_no) <> '')
  );

-- Optional index if you query/filter by mobile frequently.
CREATE INDEX IF NOT EXISTS interviews_mobile_idx ON public.interviews (mobile);
