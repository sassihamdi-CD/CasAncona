-- Seed example services so "Servizi online" shows real data.
-- Run after initial_schema. Adjust names/descriptions/prices as needed.

insert into public.services (
  name,
  name_en,
  description,
  description_en,
  duration_minutes,
  price_cents,
  currency,
  active,
  sort_order
) values
  (
    'Prima consulenza immigrazione',
    'First immigration consultation',
    'Consulenza iniziale per orientamento su permessi di soggiorno, ricongiungimento familiare e pratiche relative.',
    'Initial consultation for guidance on residence permits, family reunification and related procedures.',
    45,
    8000,
    'EUR',
    true,
    1
  ),
  (
    'Rinnovo permesso di soggiorno',
    'Residence permit renewal',
    'Supporto per la preparazione della documentazione e il rinnovo del permesso di soggiorno.',
    'Support for preparing documentation and renewing your residence permit.',
    30,
    5000,
    'EUR',
    true,
    2
  ),
  (
    'Consulenza amministrativa generale',
    'General administrative consultation',
    'Assistenza su pratiche amministrative, documenti e orientamento ai servizi del territorio.',
    'Assistance with administrative procedures, documents and signposting to local services.',
    30,
    0,
    'EUR',
    true,
    3
  )
on conflict do nothing;
