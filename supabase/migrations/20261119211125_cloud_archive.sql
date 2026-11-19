alter table public.programs add column archive_checksum text,
  add column archive_metadata jsonb;
create unique index programs_archive_checksum on public.programs(profile_id, archive_checksum);
alter table public.program_versions add column plan_snapshot jsonb;
alter table public.body_measurements add column metrics jsonb,
  add column source text not null default 'ثبت دستی';
create unique index measurements_source_date on public.body_measurements(profile_id, measurement_date, source);
create unique index workouts_one_active on public.workout_sessions(profile_id) where status='active';

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('program-pdfs','program-pdfs',false,33554432,array['application/pdf']) on conflict(id) do nothing;
create policy program_pdf_read on storage.objects for select to authenticated
using(bucket_id='program-pdfs' and private.can_access_profile_media(name));
create policy program_pdf_insert on storage.objects for insert to authenticated
with check(bucket_id='program-pdfs' and private.can_access_profile_media(name));

create function public.import_archive_program(p_profile uuid, p_checksum text, p_metadata jsonb)
returns uuid language plpgsql security invoker set search_path=pg_catalog,public as $$
declare h uuid; p uuid; v uuid; d jsonb; e jsonb; s uuid; di integer:=0; ei integer;
begin
  select household_id into strict h from public.profiles where id=p_profile;
  if not private.can_access_profile(p_profile) then raise exception 'Forbidden' using errcode='42501'; end if;
  if p_checksum !~ '^[0-9a-f]{64}$' or length(p_metadata->>'title') not between 1 and 120
    or length(p_metadata::text)>200000 then raise exception 'Invalid archive'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_profile::text,0));
  select id into p from public.programs where profile_id=p_profile and archive_checksum=p_checksum;
  if p is not null then return p; end if;
  insert into public.programs(household_id,profile_id,title,status,archive_checksum,archive_metadata)
    values(h,p_profile,p_metadata->>'title','archived',p_checksum,p_metadata) returning id into p;
  insert into public.program_versions(household_id,profile_id,program_id,version_no,title_snapshot,checksum,plan_snapshot)
    values(h,p_profile,p,1,p_metadata->>'title',p_checksum,p_metadata->'training') returning id into v;
  for d in select value from jsonb_array_elements(coalesce(p_metadata->'training'->'days','[]'::jsonb)) loop
    insert into public.program_sessions(household_id,profile_id,program_id,program_version_id,name,position,notes)
      values(h,p_profile,p,v,d->>'title',di,d->>'warmup') returning id into s;
    ei:=0;
    for e in select value from jsonb_array_elements(d->'exercises') loop
      insert into public.planned_exercises(household_id,profile_id,program_id,program_version_id,program_session_id,exercise_snapshot,position,set_count,rest_seconds,group_key,notes)
        values(h,p_profile,p,v,s,e,ei,(e->>'sets')::int,(e->>'rest')::int,e->>'group',e->>'note');
      ei:=ei+1;
    end loop;
    di:=di+1;
  end loop;
  update public.program_versions set published_at=now() where id=v;
  return p;
end $$;
revoke all on function public.import_archive_program(uuid,text,jsonb) from public,anon;
grant execute on function public.import_archive_program(uuid,text,jsonb) to authenticated;

create function public.activate_archive_program(p_profile uuid,p_checksum text)
returns void language plpgsql security invoker set search_path=pg_catalog,public as $$
begin
  if not private.can_access_profile(p_profile) then raise exception 'Forbidden' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_profile::text,0));
  if not exists(select 1 from public.programs where profile_id=p_profile and archive_checksum=p_checksum)
    then raise exception 'Program not found'; end if;
  update public.programs set status='archived' where profile_id=p_profile and status='active';
  update public.programs set status='active' where profile_id=p_profile and archive_checksum=p_checksum;
end $$;
revoke all on function public.activate_archive_program(uuid,text) from public,anon;
grant execute on function public.activate_archive_program(uuid,text) to authenticated;
