-- =============================================================================
-- Add new CAS office services (run in Supabase SQL Editor).
-- 1) Driving licence conversion to Italian
-- 2) International protection – application to the Questura
-- 3) Decreto Flussi – entry of foreign workers (Italian quota program)
-- =============================================================================

-- Ensure language columns exist (safe to run if already added)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS description_fr text;

-- Service 4: Conversione patente di guida (only if not already present)
INSERT INTO public.services (
  name,
  name_en,
  name_ar,
  name_fr,
  description,
  description_en,
  description_ar,
  description_fr,
  duration_minutes,
  price_cents,
  currency,
  stripe_price_id,
  active,
  sort_order
)
SELECT v.name, v.name_en, v.name_ar, v.name_fr, v.description, v.description_en, v.description_ar, v.description_fr, v.duration_minutes, v.price_cents, v.currency, v.stripe_price_id, v.active, v.sort_order
FROM (VALUES (
  'Conversione patente di guida'::text,
  'Conversion to Italian driving licence'::text,
  'تحويل رخصة القيادة إلى رخصة إيطالية'::text,
  'Conversion du permis de conduire en permis italien'::text,
  'Assistenza per la conversione della patente estera in patente italiana.'::text,
  'Support with converting your foreign driving licence to an Italian one.'::text,
  'المساعدة في تحويل رخصة القيادة الأجنبية إلى رخصة إيطالية.'::text,
  'Aide pour convertir votre permis de conduire étranger en permis italien.'::text,
  45::integer,
  8000::integer,
  'EUR'::text,
  null::text,
  true::boolean,
  4::integer
)) AS v(name, name_en, name_ar, name_fr, description, description_en, description_ar, description_fr, duration_minutes, price_cents, currency, stripe_price_id, active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Conversione patente di guida' OR name_en = 'Conversion to Italian driving licence');

-- Service 5: Protezione internazionale – richiesta alla Questura (only if not already present)
INSERT INTO public.services (
  name,
  name_en,
  name_ar,
  name_fr,
  description,
  description_en,
  description_ar,
  description_fr,
  duration_minutes,
  price_cents,
  currency,
  stripe_price_id,
  active,
  sort_order
)
SELECT v.name, v.name_en, v.name_ar, v.name_fr, v.description, v.description_en, v.description_ar, v.description_fr, v.duration_minutes, v.price_cents, v.currency, v.stripe_price_id, v.active, v.sort_order
FROM (VALUES (
  'Protezione internazionale – richiesta alla Questura'::text,
  'International protection – application to the Questura'::text,
  'الحماية الدولية – تقديم الطلب إلى الكويستورا'::text,
  'Protection internationale – demande auprès de la Questura'::text,
  'Supporto per la presentazione della richiesta di protezione internazionale alla Questura italiana.'::text,
  'Support for submitting an application for international protection to the Italian Questura.'::text,
  'الدعم في تقديم طلب الحماية الدولية إلى الكويستورا الإيطالية.'::text,
  'Aide au dépôt d''une demande de protection internationale auprès de la Questura italienne.'::text,
  60::integer,
  9000::integer,
  'EUR'::text,
  null::text,
  true::boolean,
  5::integer
)) AS v(name, name_en, name_ar, name_fr, description, description_en, description_ar, description_fr, duration_minutes, price_cents, currency, stripe_price_id, active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Protezione internazionale – richiesta alla Questura' OR name_en = 'International protection – application to the Questura');

-- Service 6: Decreto flussi – ingresso lavoratori stranieri (only if not already present)
INSERT INTO public.services (
  name,
  name_en,
  name_ar,
  name_fr,
  description,
  description_en,
  description_ar,
  description_fr,
  duration_minutes,
  price_cents,
  currency,
  stripe_price_id,
  active,
  sort_order
)
SELECT v.name, v.name_en, v.name_ar, v.name_fr, v.description, v.description_en, v.description_ar, v.description_fr, v.duration_minutes, v.price_cents, v.currency, v.stripe_price_id, v.active, v.sort_order
FROM (VALUES (
  'Decreto flussi – ingresso lavoratori stranieri'::text,
  'Decreto Flussi – entry of foreign workers'::text,
  'مرسوم التدفقات – دخول العمال الأجانب'::text,
  'Decreto Flussi – entrée des travailleurs étrangers'::text,
  'Assistenza per le domande di ingresso in Italia nell''ambito del decreto flussi (quote per lavoratori stranieri: stagionali, non stagionali, autonomia).'::text,
  'Support with applications for entry to Italy under the Decreto Flussi (quotas for foreign workers: seasonal, non-seasonal, self-employment).'::text,
  'المساعدة في تقديم طلبات الدخول إلى إيطاليا في إطار مرسوم التدفقات (حصص العمال الأجانب: موسميون، غير موسميين، العمل الحر).'::text,
  'Aide aux demandes d''entrée en Italie dans le cadre du Decreto Flussi (quotas pour travailleurs étrangers : saisonniers, non saisonniers, travail indépendant).'::text,
  45::integer,
  8000::integer,
  'EUR'::text,
  null::text,
  true::boolean,
  6::integer
)) AS v(name, name_en, name_ar, name_fr, description, description_en, description_ar, description_fr, duration_minutes, price_cents, currency, stripe_price_id, active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Decreto flussi – ingresso lavoratori stranieri' OR name_en = 'Decreto Flussi – entry of foreign workers');

-- Done. New services appear on /servizi and in the booking flow. Adjust price_cents or duration_minutes in Table Editor if needed.
