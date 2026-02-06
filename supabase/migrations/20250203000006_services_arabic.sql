-- Add Arabic name and description for services (for locale ar).

alter table public.services
  add column if not exists name_ar text,
  add column if not exists description_ar text;

-- Update the three seeded services with Arabic text
update public.services set
  name_ar = 'استشارة أولى في مجال الهجرة',
  description_ar = 'توجيه أولي بخصوص تصاريح الإقامة وجمع الشمل والإجراءات ذات الصلة.'
where name = 'Prima consulenza immigrazione';

update public.services set
  name_ar = 'تجديد تصريح الإقامة',
  description_ar = 'الدعم في تجهيز الوثائق وتجديد تصريح الإقامة.'
where name = 'Rinnovo permesso di soggiorno';

update public.services set
  name_ar = 'استشارة إدارية عامة',
  description_ar = 'المساعدة في الإجراءات الإدارية والوثائق والتوجيه إلى خدمات المنطقة.'
where name = 'Consulenza amministrativa generale';
