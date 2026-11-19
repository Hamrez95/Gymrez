-- One transaction persists the player snapshot and its normalized performed sets.
create function public.save_workout_snapshot(p_id uuid,p_profile uuid,p_revision integer,p_snapshot jsonb)
returns integer language plpgsql security invoker set search_path=pg_catalog,public as $$
declare w public.workout_sessions; exercises jsonb; tasks jsonb:='[]'; e jsonb; n jsonb; paired boolean;
  i integer:=0; r integer; rounds integer; before_count integer; after_count integer; log jsonb; ending timestamptz;
begin
  select * into w from public.workout_sessions where id=p_id and profile_id=p_profile for update;
  if not found then raise exception 'Session unavailable' using errcode='42501'; end if;
  if w.plan_snapshot=p_snapshot then return w.revision; end if;
  if w.revision<>p_revision or w.status<>'active' then raise exception 'Session conflict' using errcode='40001'; end if;
  if p_snapshot->'day' is distinct from w.plan_snapshot->'day' or p_snapshot->'started' is distinct from w.plan_snapshot->'started'
    or p_snapshot->'documentId' is distinct from w.plan_snapshot->'documentId' or p_snapshot->>'id'<>p_id::text
    or p_snapshot->>'profileId'<>p_profile::text or length(p_snapshot::text)>200000 then
    raise exception 'Invalid session snapshot';
  end if;
  before_count:=jsonb_array_length(w.plan_snapshot->'sets');
  after_count:=jsonb_array_length(p_snapshot->'sets');
  if after_count<before_count or
    coalesce((select jsonb_agg(value order by ordinality) from jsonb_array_elements(p_snapshot->'sets') with ordinality where ordinality<=before_count),'[]'::jsonb) <> w.plan_snapshot->'sets'
    then raise exception 'Logged sets are append only'; end if;
  exercises:=p_snapshot->'day'->'exercises';
  while i<jsonb_array_length(exercises) loop
    e:=exercises->i; n:=exercises->(i+1);
    paired:=coalesce(right(e->>'group',1)='1' and n->>'group'=left(e->>'group',1)||'2',false);
    rounds:=case when paired then greatest((e->>'sets')::int,(n->>'sets')::int) else (e->>'sets')::int end;
    for r in 1..rounds loop
      if r<=(e->>'sets')::int then tasks:=tasks||jsonb_build_array(e); end if;
      if paired and r<=(n->>'sets')::int then tasks:=tasks||jsonb_build_array(n); end if;
    end loop;
    i:=i+case when paired then 2 else 1 end;
  end loop;
  if after_count>jsonb_array_length(tasks) then raise exception 'Too many sets'; end if;
  if after_count>before_count then
    for i in before_count..after_count-1 loop
      log:=p_snapshot->'sets'->i; e:=tasks->i;
      if (log->>'task')::int<>i or (log->>'amount')::numeric<0 then raise exception 'Invalid set'; end if;
      insert into public.performed_sets(household_id,profile_id,workout_session_id,exercise_snapshot,position,actual_reps,load_kg,duration_seconds,is_done,completed_at)
      values(w.household_id,p_profile,p_id,e,i,
        case when e->>'unit'<>'seconds' then (log->>'amount')::numeric end,
        (log->>'weight')::numeric,
        case when e->>'unit'='seconds' then (log->>'amount')::integer end,true,now());
    end loop;
  end if;
  if p_snapshot ? 'finished' then
    ending:=to_timestamp((p_snapshot->>'finished')::numeric/1000);
    if ending<w.started_at then raise exception 'Invalid finish time'; end if;
  end if;
  update public.workout_sessions set plan_snapshot=p_snapshot,
    status=case when ending is null then 'active' else 'completed' end,
    ended_at=ending, elapsed_seconds=greatest(0,floor(extract(epoch from (coalesce(ending,now())-w.started_at))))
    where id=p_id returning revision into p_revision;
  return p_revision;
end $$;
revoke all on function public.save_workout_snapshot(uuid,uuid,integer,jsonb) from public,anon;
grant execute on function public.save_workout_snapshot(uuid,uuid,integer,jsonb) to authenticated;
