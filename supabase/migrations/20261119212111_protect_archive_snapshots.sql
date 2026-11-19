-- The editable program envelope must not change its published training snapshot.
create function private.guard_archive_snapshot() returns trigger language plpgsql
set search_path=pg_catalog,public as $$
begin
  if old.archive_checksum is not null and
    (new.archive_checksum is distinct from old.archive_checksum or new.archive_metadata is distinct from old.archive_metadata) then
    raise exception 'Imported archive snapshots are immutable' using errcode='55000';
  end if;
  return new;
end $$;
revoke all on function private.guard_archive_snapshot() from public,anon,authenticated;
create trigger archive_snapshot_immutable before update on public.programs
for each row execute function private.guard_archive_snapshot();
