-- Seed one staff member and weekly availability so slot computation returns slots.
-- Monday–Friday 09:00–13:00 and 14:00–18:00 (Europe/Rome). Adjust as needed.

insert into public.staff (name, email, role, active)
values ('Operatore CAS', 'operatore@cas-ancona.example', 'lawyer', true)
on conflict (email) do nothing;

-- We need to insert availability for the staff we just created.
-- Use a DO block to get the staff id and insert availability.

do $$
declare
  sid uuid;
begin
  select id into sid from public.staff where email = 'operatore@cas-ancona.example' limit 1;
  if sid is not null then
    -- Monday (1) to Friday (5): 09:00-13:00 and 14:00-18:00
    insert into public.staff_availability (staff_id, day_of_week, start_time, end_time)
    values
      (sid, 1, '09:00', '13:00'),
      (sid, 1, '14:00', '18:00'),
      (sid, 2, '09:00', '13:00'),
      (sid, 2, '14:00', '18:00'),
      (sid, 3, '09:00', '13:00'),
      (sid, 3, '14:00', '18:00'),
      (sid, 4, '09:00', '13:00'),
      (sid, 4, '14:00', '18:00'),
      (sid, 5, '09:00', '13:00'),
      (sid, 5, '14:00', '18:00')
    on conflict (staff_id, day_of_week, start_time) do nothing;
  end if;
end $$;
