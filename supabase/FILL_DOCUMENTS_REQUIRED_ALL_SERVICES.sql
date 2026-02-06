-- =============================================================================
-- Fill "required documents" for ALL services in all 4 languages.
-- Run in Supabase SQL Editor. After this, every card shows "Documents to prepare"
-- in the correct language (IT/EN/FR/AR). One line per document = one bullet.
-- =============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS documents_required text,
  ADD COLUMN IF NOT EXISTS documents_required_en text,
  ADD COLUMN IF NOT EXISTS documents_required_ar text,
  ADD COLUMN IF NOT EXISTS documents_required_fr text;

-- 1. Prima consulenza immigrazione
UPDATE public.services SET
  documents_required = E'Documento d''identità o passaporto in corso di validità\nPermesso di soggiorno (se già in possesso)\nCodice fiscale\nEventuale documentazione sulla pratica',
  documents_required_en = E'Valid ID or passport\nResidence permit (if you have one)\nTax code (codice fiscale)\nAny documents you already have about your case',
  documents_required_fr = E'Pièce d''identité ou passeport en cours de validité\nTitre de séjour (si vous en avez un)\nCode fiscal (codice fiscale)\nTout document déjà en votre possession sur votre dossier',
  documents_required_ar = E'وثيقة هوية أو جواز سفر ساري المفعول\nتصريح إقامة (إن وُجد)\nالرمز الضريبي (codice fiscale)\nأي وثائق لديك بالفعل عن الملف'
WHERE name = 'Prima consulenza immigrazione' OR name_en = 'First immigration consultation';

-- 2. Rinnovo permesso di soggiorno
UPDATE public.services SET
  documents_required = E'Permesso di soggiorno in scadenza\nDocumento d''identità o passaporto\nCodice fiscale\nModulo compilato (se richiesto dalla questura)',
  documents_required_en = E'Current residence permit\nID or passport\nTax code\nCompleted form (if required by questura)',
  documents_required_fr = E'Titre de séjour en cours de validité\nPièce d''identité ou passeport\nCode fiscal\nFormulaire rempli (si demandé par la questura)',
  documents_required_ar = E'تصريح الإقامة الحالي\nالهوية أو جواز السفر\nالرمز الضريبي\nالنموذج المعبأ (إن طلبته الكويستورا)'
WHERE name = 'Rinnovo permesso di soggiorno' OR name_en = 'Residence permit renewal';

-- 3. Consulenza amministrativa generale
UPDATE public.services SET
  documents_required = E'Documento d''identità\nCodice fiscale\nEventuale documentazione relativa alla pratica',
  documents_required_en = E'ID document\nTax code\nAny documents related to your case',
  documents_required_fr = E'Pièce d''identité\nCode fiscal\nTout document relatif à votre dossier',
  documents_required_ar = E'وثيقة الهوية\nالرمز الضريبي\nأي وثائق تتعلق بملفك'
WHERE name = 'Consulenza amministrativa generale' OR name_en = 'General administrative consultation';

-- 4. Conversione patente di guida
UPDATE public.services SET
  documents_required = E'Patente estera in corso di validità\nDocumento d''identità o passaporto\nCodice fiscale\nFototessera\nEventuale attestato di residenza',
  documents_required_en = E'Valid foreign driving licence\nID or passport\nTax code\nPassport-style photo\nProof of residence (if required)',
  documents_required_fr = E'Permis de conduire étranger en cours de validité\nPièce d''identité ou passeport\nCode fiscal\nPhoto d''identité\nJustificatif de domicile (si requis)',
  documents_required_ar = E'رخصة قيادة أجنبية سارية\nالهوية أو جواز السفر\nالرمز الضريبي\nصورة شخصية\nإثبات الإقامة (إن لزم)'
WHERE name = 'Conversione patente di guida' OR name_en = 'Conversion to Italian driving licence';

-- 5. Protezione internazionale – richiesta alla Questura
UPDATE public.services SET
  documents_required = E'Documento d''identità o passaporto (se disponibile)\nCodice fiscale\nEventuale documentazione a supporto della richiesta\nTutti i documenti di viaggio o ingresso in Italia',
  documents_required_en = E'ID or passport (if available)\nTax code\nAny documents supporting your application\nAll travel or entry documents to Italy',
  documents_required_fr = E'Pièce d''identité ou passeport (si disponible)\nCode fiscal\nTout document à l''appui de votre demande\nTous les documents de voyage ou d''entrée en Italie',
  documents_required_ar = E'الهوية أو جواز السفر (إن وُجد)\nالرمز الضريبي\nأي وثائق تدعم طلبك\nجميع وثائق السفر أو الدخول إلى إيطاليا'
WHERE name = 'Protezione internazionale – richiesta alla Questura' OR name_en = 'International protection – application to the Questura';

-- 6. Decreto flussi – ingresso lavoratori stranieri
UPDATE public.services SET
  documents_required = E'Documento d''identità o passaporto\nCodice fiscale\nEventuale contratto o proposta di lavoro\nDocumentazione del datore di lavoro (se già individuato)',
  documents_required_en = E'ID or passport\nTax code\nEmployment contract or job offer (if any)\nEmployer documentation (if already identified)',
  documents_required_fr = E'Pièce d''identité ou passeport\nCode fiscal\nContrat de travail ou offre d''emploi (le cas échéant)\nDocuments de l''employeur (si déjà identifié)',
  documents_required_ar = E'الهوية أو جواز السفر\nالرمز الضريبي\nعقد العمل أو عرض العمل (إن وُجد)\nوثائق صاحب العمل (إن وُجد)'
WHERE name = 'Decreto flussi – ingresso lavoratori stranieri' OR name_en = 'Decreto Flussi – entry of foreign workers';

-- Done. Reload the site: every service card shows "Documents to prepare" in the correct language.
