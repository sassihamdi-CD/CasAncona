-- =============================================================================
-- RUN ONCE. Two options (no browser needed for option B):
-- A) Supabase Dashboard → SQL Editor → Paste this file → Run
-- B) CLI: add DATABASE_URL to .env (Settings → Database → Connection string URI)
--    then: npm install && npm run db:fix-arabic
-- Fixes service names/descriptions in Arabic (and ensures columns exist).
-- =============================================================================

-- 1. Ensure Arabic columns exist
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_ar text;

-- 2. Set Arabic text for all three services (match by Italian or English name)
UPDATE public.services SET
  name_ar = 'استشارة أولى في مجال الهجرة',
  description_ar = 'توجيه أولي بخصوص تصاريح الإقامة وجمع الشمل والإجراءات ذات الصلة.'
WHERE name = 'Prima consulenza immigrazione' OR name_en = 'First immigration consultation';

UPDATE public.services SET
  name_ar = 'تجديد تصريح الإقامة',
  description_ar = 'الدعم في تجهيز الوثائق وتجديد تصريح الإقامة.'
WHERE name = 'Rinnovo permesso di soggiorno' OR name_en = 'Residence permit renewal';

UPDATE public.services SET
  name_ar = 'استشارة إدارية عامة',
  description_ar = 'المساعدة في الإجراءات الإدارية والوثائق والتوجيه إلى خدمات المنطقة.'
WHERE name = 'Consulenza amministrativa generale' OR name_en = 'General administrative consultation';

-- Done. Reload your site; /ar/servizi and /ar/book will show Arabic service names.
