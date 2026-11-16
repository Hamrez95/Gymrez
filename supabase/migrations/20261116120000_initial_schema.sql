-- Initial Gymrez schema. Do not put personal data in seed files.
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.households(id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 100), created_at timestamptz not null default now());
create table public.household_members(household_id uuid not null references public.households on delete cascade, user_id uuid not null references auth.users on delete cascade, role text not null default 'member' check(role in ('owner','member')), created_at timestamptz not null default now(), primary key(household_id,user_id));
create table public.profiles(id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households on delete cascade, display_name text not null check(length(trim(display_name)) between 1 and 80), birth_date date, height_cm numeric(5,2) check(height_cm is null or height_cm between 50 and 260), goal text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revision integer not null default 1 check(revision>0), unique(id,household_id));

create table public.exercises(id uuid primary key default gen_random_uuid(), slug text not null unique, name_fa text not null, name_en text, muscle_group text, equipment text, instructions text, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.exercise_media(id uuid primary key default gen_random_uuid(), exercise_id uuid not null references public.exercises on delete cascade, storage_path text not null, alt_fa text not null, license text not null, sort_order integer not null default 0, created_at timestamptz not null default now(), unique(exercise_id,storage_path));

create table public.programs(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, title text not null check(length(trim(title)) between 1 and 120), status text not null default 'draft' check(status in ('draft','active','archived')), starts_on date, ends_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revision integer not null default 1 check(revision>0), foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, unique(id,profile_id), check(ends_on is null or starts_on is null or ends_on>=starts_on));
create unique index programs_one_active_per_profile on public.programs(profile_id) where status='active';
create table public.program_versions(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, program_id uuid not null, version_no integer not null check(version_no>0), title_snapshot text not null, source_id text, source_version text, checksum text, published_at timestamptz, created_at timestamptz not null default now(), unique(program_id,version_no), unique(id,program_id,profile_id), foreign key(program_id,profile_id) references public.programs(id,profile_id) on delete cascade, foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade);
create table public.program_sessions(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, program_id uuid not null, program_version_id uuid not null, name text not null, weekday smallint check(weekday between 0 and 6), position integer not null default 0, notes text, created_at timestamptz not null default now(), foreign key(program_version_id,program_id,profile_id) references public.program_versions(id,program_id,profile_id) on delete cascade, foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, unique(id,program_version_id,program_id,profile_id), unique(program_version_id,position));
create table public.planned_exercises(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, program_id uuid not null, program_version_id uuid not null, program_session_id uuid not null, exercise_id uuid references public.exercises on delete set null, exercise_snapshot jsonb not null, position integer not null default 0, group_key text, set_count integer check(set_count between 1 and 30), reps_min integer check(reps_min>0), reps_max integer check(reps_max>0), rest_seconds integer check(rest_seconds between 0 and 3600), tempo text, notes text, created_at timestamptz not null default now(), foreign key(program_session_id,program_version_id,program_id,profile_id) references public.program_sessions(id,program_version_id,program_id,profile_id) on delete cascade, foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, check(reps_min is null or reps_max is null or reps_max>=reps_min), unique(program_session_id,position));

create table public.workout_sessions(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, program_id uuid, program_version_id uuid, title_snapshot text not null, plan_snapshot jsonb not null default '{}'::jsonb, status text not null default 'active' check(status in ('active','completed','abandoned')), started_at timestamptz not null default now(), ended_at timestamptz, elapsed_seconds integer not null default 0 check(elapsed_seconds>=0), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revision integer not null default 1 check(revision>0), foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, foreign key(program_id,profile_id) references public.programs(id,profile_id) on delete restrict, foreign key(program_version_id,program_id,profile_id) references public.program_versions(id,program_id,profile_id) on delete restrict, unique(id,profile_id), check(status<>'completed' or ended_at is not null));
create table public.performed_sets(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, workout_session_id uuid not null, client_id uuid not null default gen_random_uuid(), exercise_id uuid references public.exercises on delete set null, exercise_snapshot jsonb not null, position integer not null default 0, actual_reps numeric(6,2) check(actual_reps is null or actual_reps>=0), load_kg numeric(7,2) check(load_kg is null or load_kg>=0), duration_seconds integer check(duration_seconds is null or duration_seconds>=0), distance_m numeric(9,2) check(distance_m is null or distance_m>=0), is_done boolean not null default false, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revision integer not null default 1 check(revision>0), foreign key(workout_session_id,profile_id) references public.workout_sessions(id,profile_id) on delete cascade, foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, unique(workout_session_id,client_id), unique(workout_session_id,position));

create table public.body_measurements(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, measurement_date date not null, height_cm numeric(5,2) check(height_cm is null or height_cm between 50 and 260), weight_kg numeric(6,2) check(weight_kg is null or weight_kg between 10 and 500), waist_cm numeric(6,2) check(waist_cm is null or waist_cm>0), hip_cm numeric(6,2) check(hip_cm is null or hip_cm>0), chest_cm numeric(6,2) check(chest_cm is null or chest_cm>0), arm_cm numeric(6,2) check(arm_cm is null or arm_cm>0), thigh_cm numeric(6,2) check(thigh_cm is null or thigh_cm>0), neck_cm numeric(6,2) check(neck_cm is null or neck_cm>0), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revision integer not null default 1 check(revision>0), foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade);
create index body_measurements_profile_date on public.body_measurements(profile_id,measurement_date desc);
create table public.program_imports(id uuid primary key default gen_random_uuid(), household_id uuid not null, profile_id uuid not null, source_id text not null, source_version text not null, checksum text not null, imported_program_id uuid references public.programs on delete set null, imported_at timestamptz not null default now(), foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, unique(household_id,source_id,source_version,checksum));
create table public.sync_operations(id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households on delete cascade, profile_id uuid, operation_id uuid not null, entity_type text not null, payload jsonb not null, status text not null default 'accepted' check(status in ('accepted','applied','rejected')), result jsonb, created_at timestamptz not null default now(), processed_at timestamptz, foreign key(profile_id,household_id) references public.profiles(id,household_id) on delete cascade, unique(household_id,operation_id));

create function private.is_household_member(target uuid) returns boolean language sql stable security definer set search_path=pg_catalog,public as $$ select exists(select 1 from public.household_members m where m.household_id=target and m.user_id=(select auth.uid())) $$;
create function private.can_access_profile(target uuid) returns boolean language sql stable security definer set search_path=pg_catalog,public as $$ select exists(select 1 from public.profiles p join public.household_members m on m.household_id=p.household_id where p.id=target and m.user_id=(select auth.uid())) $$;
revoke all on function private.is_household_member(uuid),private.can_access_profile(uuid) from public,anon;
grant execute on function private.is_household_member(uuid),private.can_access_profile(uuid) to authenticated;

create function public.touch_updated_at() returns trigger language plpgsql set search_path=pg_catalog as $$ begin new.updated_at=now(); new.revision=old.revision+1; return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger programs_touch before update on public.programs for each row execute function public.touch_updated_at();
create trigger workouts_touch before update on public.workout_sessions for each row execute function public.touch_updated_at();
create trigger sets_touch before update on public.performed_sets for each row execute function public.touch_updated_at();
create trigger measurements_touch before update on public.body_measurements for each row execute function public.touch_updated_at();

create function private.guard_version_edits() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare target uuid;
begin
 if tg_table_name='program_versions' then
   if tg_op='DELETE' then if old.published_at is not null then raise exception 'Published versions are immutable' using errcode='55000'; end if; return old; end if;
   if old.published_at is not null then raise exception 'Published versions are immutable' using errcode='55000'; end if; return new;
 end if;
 if tg_op='DELETE' then target:=old.program_version_id; else target:=new.program_version_id; end if;
 if exists(select 1 from public.program_versions v where v.id=target and v.published_at is not null) then raise exception 'Published versions are immutable' using errcode='55000'; end if;
 if tg_op='DELETE' then return old; else return new; end if;
end $$;
create trigger versions_immutable before update or delete on public.program_versions for each row execute function private.guard_version_edits();
create trigger sessions_draft_only before insert or update or delete on public.program_sessions for each row execute function private.guard_version_edits();
create trigger planned_draft_only before insert or update or delete on public.planned_exercises for each row execute function private.guard_version_edits();

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_media enable row level security;
alter table public.programs enable row level security;
alter table public.program_versions enable row level security;
alter table public.program_sessions enable row level security;
alter table public.planned_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.performed_sets enable row level security;
alter table public.body_measurements enable row level security;
alter table public.program_imports enable row level security;
alter table public.sync_operations enable row level security;
create policy households_read on public.households for select to authenticated using(private.is_household_member(id));
create policy memberships_read on public.household_members for select to authenticated using(private.is_household_member(household_id));
create policy profiles_access on public.profiles for all to authenticated using(private.is_household_member(household_id)) with check(private.is_household_member(household_id));
create policy exercises_read on public.exercises for select to authenticated using(is_active);
create policy media_read on public.exercise_media for select to authenticated using(exists(select 1 from public.exercises e where e.id=exercise_id and e.is_active));
create policy programs_access on public.programs for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy versions_read on public.program_versions for select to authenticated using(private.can_access_profile(profile_id));
create policy versions_insert on public.program_versions for insert to authenticated with check(private.can_access_profile(profile_id) and published_at is null);
create policy versions_update on public.program_versions for update to authenticated using(private.can_access_profile(profile_id) and published_at is null) with check(private.can_access_profile(profile_id));
create policy versions_delete on public.program_versions for delete to authenticated using(private.can_access_profile(profile_id) and published_at is null);
create policy sessions_access on public.program_sessions for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy planned_access on public.planned_exercises for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy workouts_access on public.workout_sessions for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy sets_access on public.performed_sets for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy measurements_access on public.body_measurements for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy imports_access on public.program_imports for all to authenticated using(private.can_access_profile(profile_id)) with check(private.can_access_profile(profile_id));
create policy sync_access on public.sync_operations for all to authenticated using((profile_id is null and private.is_household_member(household_id)) or (profile_id is not null and private.can_access_profile(profile_id))) with check((profile_id is null and private.is_household_member(household_id)) or (profile_id is not null and private.can_access_profile(profile_id)));

grant select on public.households,public.household_members,public.profiles,public.exercises,public.exercise_media,public.programs,public.program_versions,public.program_sessions,public.planned_exercises,public.workout_sessions,public.performed_sets,public.body_measurements,public.program_imports,public.sync_operations to authenticated;
grant insert,update,delete on public.profiles,public.programs,public.program_versions,public.program_sessions,public.planned_exercises,public.workout_sessions,public.performed_sets,public.body_measurements,public.program_imports,public.sync_operations to authenticated;
