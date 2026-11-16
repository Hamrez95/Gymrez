-- Add covering indexes for foreign keys reported by Supabase's performance advisor.
-- The existing body_measurements_profile_date and sync_operations household indexes
-- remain in place; they serve query order and the household operation key respectively.
create index if not exists body_measurements_profile_household_idx on public.body_measurements(profile_id, household_id);
create index if not exists household_members_user_idx on public.household_members(user_id);
create index if not exists performed_sets_exercise_idx on public.performed_sets(exercise_id);
create index if not exists performed_sets_profile_household_idx on public.performed_sets(profile_id, household_id);
create index if not exists performed_sets_workout_profile_idx on public.performed_sets(workout_session_id, profile_id);
create index if not exists planned_exercises_exercise_idx on public.planned_exercises(exercise_id);
create index if not exists planned_exercises_profile_household_idx on public.planned_exercises(profile_id, household_id);
create index if not exists planned_exercises_session_version_program_profile_idx on public.planned_exercises(program_session_id, program_version_id, program_id, profile_id);
create index if not exists profiles_household_idx on public.profiles(household_id);
create index if not exists program_imports_imported_program_profile_idx on public.program_imports(imported_program_id, profile_id);
create index if not exists program_imports_profile_household_idx on public.program_imports(profile_id, household_id);
create index if not exists program_sessions_profile_household_idx on public.program_sessions(profile_id, household_id);
create index if not exists program_sessions_version_program_profile_idx on public.program_sessions(program_version_id, program_id, profile_id);
create index if not exists program_versions_profile_household_idx on public.program_versions(profile_id, household_id);
create index if not exists program_versions_program_profile_idx on public.program_versions(program_id, profile_id);
create index if not exists programs_profile_household_idx on public.programs(profile_id, household_id);
create index if not exists sync_operations_profile_household_idx on public.sync_operations(profile_id, household_id);
create index if not exists workout_sessions_profile_household_idx on public.workout_sessions(profile_id, household_id);
create index if not exists workout_sessions_program_profile_idx on public.workout_sessions(program_id, profile_id);
create index if not exists workout_sessions_version_program_profile_idx on public.workout_sessions(program_version_id, program_id, profile_id);
