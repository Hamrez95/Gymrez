-- T07: transactional program draft creation/versioning and activation.
-- All writes run as the authenticated caller and remain subject to the existing RLS policies.
create or replace function public.save_program_draft(
  p_household_id uuid,
  p_profile_id uuid,
  p_title text,
  p_starts_on date,
  p_ends_on date,
  p_sessions jsonb,
  p_program_id uuid default null,
  p_expected_revision integer default null
) returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_program_id uuid;
  v_version_id uuid;
  v_version_no integer;
  v_revision integer;
  v_published_at timestamptz;
begin
  if length(trim(coalesce(p_title, ''))) not between 1 and 120 then
    raise exception 'Program title is required' using errcode = '22023';
  end if;
  if p_ends_on is not null and p_starts_on is not null and p_ends_on < p_starts_on then
    raise exception 'Program end date must not precede its start date' using errcode = '22023';
  end if;
  if jsonb_typeof(p_sessions) is distinct from 'array' then
    raise exception 'Sessions must be a JSON array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_sessions) not between 1 and 7 then
    raise exception 'Choose between one and seven weekly sessions' using errcode = '22023';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_sessions) as s(name text, weekday integer, position integer, notes text)
    where length(trim(coalesce(s.name, ''))) not between 1 and 80
       or s.weekday is null or s.weekday not between 0 and 6
  ) then
    raise exception 'Each session needs a name and a valid weekday' using errcode = '22023';
  end if;
  if (select count(distinct s.weekday)
      from jsonb_to_recordset(p_sessions) as s(name text, weekday integer, position integer, notes text))
      <> jsonb_array_length(p_sessions) then
    raise exception 'Each weekday can be selected once' using errcode = '22023';
  end if;

  if p_program_id is null then
    insert into public.programs(household_id, profile_id, title, starts_on, ends_on, status)
    values (p_household_id, p_profile_id, trim(p_title), p_starts_on, p_ends_on, 'draft')
    returning id into v_program_id;

    insert into public.program_versions(household_id, profile_id, program_id, version_no, title_snapshot)
    values (p_household_id, p_profile_id, v_program_id, 1, trim(p_title))
    returning id into v_version_id;
  else
    select p.id, p.revision
      into v_program_id, v_revision
      from public.programs p
      where p.id = p_program_id
        and p.household_id = p_household_id
        and p.profile_id = p_profile_id
      for update;

    if not found then
      raise exception 'Program not found' using errcode = 'P0002';
    end if;
    if p_expected_revision is null or p_expected_revision <> v_revision then
      raise exception 'Program changed elsewhere; reload before saving' using errcode = 'P0001';
    end if;

    select v.id, v.version_no, v.published_at
      into v_version_id, v_version_no, v_published_at
      from public.program_versions v
      where v.program_id = v_program_id and v.profile_id = p_profile_id
      order by v.version_no desc
      limit 1
      for update;

    if v_version_id is null then
      raise exception 'Program has no editable version' using errcode = '55000';
    elsif v_published_at is not null then
      v_version_no := v_version_no + 1;
      insert into public.program_versions(household_id, profile_id, program_id, version_no, title_snapshot)
      values (p_household_id, p_profile_id, v_program_id, v_version_no, trim(p_title))
      returning id into v_version_id;
    else
      update public.program_versions
        set title_snapshot = trim(p_title)
        where id = v_version_id;
      delete from public.program_sessions
        where program_version_id = v_version_id and program_id = v_program_id and profile_id = p_profile_id;
    end if;

    update public.programs
      set title = trim(p_title), starts_on = p_starts_on, ends_on = p_ends_on
      where id = v_program_id and profile_id = p_profile_id;
  end if;

  insert into public.program_sessions(
    household_id, profile_id, program_id, program_version_id, name, weekday, position, notes
  )
  select p_household_id, p_profile_id, v_program_id, v_version_id,
         trim(s.name), s.weekday::smallint, coalesce(s.position, s.ordinality::integer - 1), nullif(trim(s.notes), '')
  from jsonb_to_recordset(p_sessions) with ordinality
       as s(name text, weekday integer, position integer, notes text, ordinality bigint);

  return v_program_id;
end;
$function$;

create or replace function public.activate_program(
  p_household_id uuid,
  p_profile_id uuid,
  p_program_id uuid
) returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_status text;
  v_version_id uuid;
begin
  -- Serialize activations for this profile. The partial unique index remains a database-level backstop.
  perform p.id from public.profiles p
   where p.id = p_profile_id and p.household_id = p_household_id
   for update;
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  select p.status into v_status
    from public.programs p
    where p.id = p_program_id
      and p.household_id = p_household_id
      and p.profile_id = p_profile_id
    for update;
  if not found then
    raise exception 'Program not found' using errcode = 'P0002';
  end if;
  if v_status = 'archived' then
    raise exception 'Archived programs cannot be activated' using errcode = '22023';
  end if;

  select v.id into v_version_id
    from public.program_versions v
    where v.program_id = p_program_id and v.profile_id = p_profile_id
    order by v.version_no desc
    limit 1
    for update;
  if v_version_id is null then
    raise exception 'Program has no version to publish' using errcode = '55000';
  end if;

  update public.programs
    set status = 'archived'
    where profile_id = p_profile_id and household_id = p_household_id
      and status = 'active' and id <> p_program_id;
  update public.programs
    set status = 'active'
    where id = p_program_id and profile_id = p_profile_id and household_id = p_household_id;
  update public.program_versions
    set published_at = coalesce(published_at, now())
    where id = v_version_id and profile_id = p_profile_id and published_at is null;

  return p_program_id;
end;
$function$;

revoke all on function public.save_program_draft(uuid, uuid, text, date, date, jsonb, uuid, integer) from public, anon;
revoke all on function public.activate_program(uuid, uuid, uuid) from public, anon;
grant execute on function public.save_program_draft(uuid, uuid, text, date, date, jsonb, uuid, integer) to authenticated;
grant execute on function public.activate_program(uuid, uuid, uuid) to authenticated;
