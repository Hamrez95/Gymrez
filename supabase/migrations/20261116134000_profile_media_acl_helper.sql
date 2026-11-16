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
