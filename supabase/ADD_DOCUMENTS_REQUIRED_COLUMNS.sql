-- =============================================================================
-- Add "required documents" per service (run in Supabase SQL Editor).
-- Users see what to bring before booking. Content is per-language (IT, EN, AR, FR).
-- =============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS documents_required text,
  ADD COLUMN IF NOT EXISTS documents_required_en text,
  ADD COLUMN IF NOT EXISTS documents_required_ar text,
  ADD COLUMN IF NOT EXISTS documents_required_fr text;

-- Optional: example content for one service (Italian). Edit or add more in Table Editor.
-- One line per document; users see an expandable "Documenti da preparare" on the card.

UPDATE public.services
SET
  documents_required = 'Documento d''identità o passaporto in corso di validità
Permesso di soggiorno (se già in possesso)
Codice fiscale
Eventuale documentazione già in tuo possesso sulla pratica'
WHERE name = 'Prima consulenza immigrazione';


-- After running this, fill documents_required (and _en, _ar, _fr if you want per-language)
-- in Supabase Table Editor → services. Use newlines to get one bullet per line on the card.
