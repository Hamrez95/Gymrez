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
