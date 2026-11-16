-- Private profile uploads are stored under <household UUID>/<profile UUID>/<file>.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-media','profile-media',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create or replace function private.can_access_profile_media(object_name text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, storage
as $media$
  select exists (
    select 1
    from public.profiles p
    join public.household_members m on m.household_id = p.household_id
    where p.id::text = (storage.foldername(object_name))[2]
      and p.household_id::text = (storage.foldername(object_name))[1]
      and m.user_id = (select auth.uid())
  )
$media$;

revoke all on function private.can_access_profile_media(text) from public, anon;
grant execute on function private.can_access_profile_media(text) to authenticated;

alter table storage.objects enable row level security;

create policy profile_media_select on storage.objects
for select to authenticated
using (bucket_id = 'profile-media' and private.can_access_profile_media(name));

create policy profile_media_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-media' and private.can_access_profile_media(name));

create policy profile_media_update on storage.objects
for update to authenticated
using (bucket_id = 'profile-media' and private.can_access_profile_media(name))
with check (bucket_id = 'profile-media' and private.can_access_profile_media(name));

create policy profile_media_delete on storage.objects
for delete to authenticated
using (bucket_id = 'profile-media' and private.can_access_profile_media(name));

revoke all on table storage.objects from public, anon;
grant select, insert, update, delete on table storage.objects to authenticated;

revoke all on table
  public.households, public.household_members, public.profiles, public.exercises,
  public.exercise_media, public.programs, public.program_versions, public.program_sessions,
  public.planned_exercises, public.workout_sessions, public.performed_sets,
  public.body_measurements, public.program_imports, public.sync_operations
from public, anon;

grant select on
  public.households, public.household_members, public.profiles, public.exercises,
  public.exercise_media, public.programs, public.program_versions, public.program_sessions,
  public.planned_exercises, public.workout_sessions, public.performed_sets,
  public.body_measurements, public.program_imports, public.sync_operations
to authenticated;

grant insert, update, delete on
  public.profiles, public.programs, public.program_versions, public.program_sessions,
  public.planned_exercises, public.workout_sessions, public.performed_sets,
  public.body_measurements, public.program_imports, public.sync_operations
to authenticated;
