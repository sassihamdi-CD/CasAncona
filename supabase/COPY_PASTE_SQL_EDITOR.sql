-- =============================================================================
-- COPY ALL BELOW → Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Covers: Italian, English, Arabic, French for all 3 services. Run once.
-- =============================================================================

-- 1. Ensure all language columns exist
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_ar text,
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS description_fr text;

-- 2. Service 1: Immigration consultation
UPDATE public.services SET
  name = COALESCE(name, 'Prima consulenza immigrazione'),
  name_en = 'First immigration consultation',
  name_ar = 'استشارة أولى في مجال الهجرة',
  name_fr = 'Première consultation en immigration',
  description = COALESCE(description, 'Consulenza iniziale per orientamento su permessi di soggiorno, ricongiungimento familiare e pratiche relative.'),
  description_en = 'Initial consultation for guidance on residence permits, family reunification and related procedures.',
  description_ar = 'توجيه أولي بخصوص تصاريح الإقامة وجمع الشمل والإجراءات ذات الصلة.',
  description_fr = 'Consultation initiale pour orientation sur les titres de séjour, le regroupement familial et les démarches associées.'
WHERE name = 'Prima consulenza immigrazione' OR name_en = 'First immigration consultation';

-- 3. Service 2: Residence permit renewal
UPDATE public.services SET
  name = COALESCE(name, 'Rinnovo permesso di soggiorno'),
  name_en = 'Residence permit renewal',
  name_ar = 'تجديد تصريح الإقامة',
  name_fr = 'Renouvellement du permis de séjour',
  description = COALESCE(description, 'Supporto per la preparazione della documentazione e il rinnovo del permesso di soggiorno.'),
  description_en = 'Support for preparing documentation and renewing your residence permit.',
  description_ar = 'الدعم في تجهيز الوثائق وتجديد تصريح الإقامة.',
  description_fr = 'Aide à la préparation du dossier et au renouvellement du permis de séjour.'
WHERE name = 'Rinnovo permesso di soggiorno' OR name_en = 'Residence permit renewal';

-- 4. Service 3: General administrative consultation
UPDATE public.services SET
  name = COALESCE(name, 'Consulenza amministrativa generale'),
  name_en = 'General administrative consultation',
  name_ar = 'استشارة إدارية عامة',
  name_fr = 'Consultation administrative générale',
  description = COALESCE(description, 'Assistenza su pratiche amministrative, documenti e orientamento ai servizi del territorio.'),
  description_en = 'Assistance with administrative procedures, documents and signposting to local services.',
  description_ar = 'المساعدة في الإجراءات الإدارية والوثائق والتوجيه إلى خدمات المنطقة.',
  description_fr = 'Aide pour les démarches administratives, les documents et l''orientation vers les services du territoire.'
WHERE name = 'Consulenza amministrativa generale' OR name_en = 'General administrative consultation';

-- Done. Reload /it, /en, /ar, /fr pages; service cards will show the correct language.
