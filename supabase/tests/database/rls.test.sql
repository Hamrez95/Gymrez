begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users(id,aud,role,email,encrypted_password,raw_app_meta_data,raw_user_meta_data)
values ('a0000000-0000-4000-8000-000000000001','authenticated','authenticated','a@test.invalid','x','{}','{}'),
       ('b0000000-0000-4000-8000-000000000002','authenticated','authenticated','b@test.invalid','x','{}','{}')
on conflict(id) do nothing;
insert into public.households(id,name)
values ('c0000000-0000-4000-8000-000000000003','test household'),
       ('20000000-0000-4000-8000-000000000008','other household');
insert into public.household_members(household_id,user_id)
values ('c0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001');
insert into public.profiles(id,household_id,display_name)
values ('d0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000003','Synthetic'),
       ('30000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000008','Other synthetic');
insert into public.programs(id,household_id,profile_id,title)
values ('e0000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','Version test');
insert into public.program_versions(id,household_id,profile_id,program_id,version_no,title_snapshot)
values ('f0000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000005',1,'Version test');
insert into public.program_sessions(id,household_id,profile_id,program_id,program_version_id,name,position)
values ('10000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000005','f0000000-0000-4000-8000-000000000006','Session',0);
insert into storage.objects(id,bucket_id,name,metadata)
values ('40000000-0000-4000-8000-000000000010','profile-media','c0000000-0000-4000-8000-000000000003/d0000000-0000-4000-8000-000000000004/progress/front.webp','{"mimetype":"image/webp"}'::jsonb);
update public.program_versions set published_at=now() where id='f0000000-0000-4000-8000-000000000006';

set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select is((select count(*)::int from public.profiles),1,'member sees profile in household');
select is((select count(*)::int from storage.objects where bucket_id='profile-media'),1,'member sees profile media');
select throws_ok(
  $test$update storage.objects set name='20000000-0000-4000-8000-000000000008/30000000-0000-4000-8000-000000000009/progress/front.webp' where id='40000000-0000-4000-8000-000000000010'$test$,
  '42501',null,'member cannot move media to an unrelated profile');
select throws_ok(
  $test$update public.profiles set household_id='20000000-0000-4000-8000-000000000008' where id='d0000000-0000-4000-8000-000000000004'$test$,
  '42501',null,'member cannot move a profile to an unrelated household');
select set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000002',true);
select is((select count(*)::int from public.profiles),0,'non-member sees no profiles');
select is((select count(*)::int from storage.objects where bucket_id='profile-media'),0,'non-member sees no profile media');
update public.profiles set display_name='Unauthorized' where id='d0000000-0000-4000-8000-000000000004';
select throws_ok(
  $test$insert into storage.objects(bucket_id,name,metadata) values ('profile-media','c0000000-0000-4000-8000-000000000003/d0000000-0000-4000-8000-000000000004/progress/outsider.webp','{}'::jsonb)$test$,
  '42501',null,'non-member cannot upload profile media');
reset role;
select is((select display_name from public.profiles where id='d0000000-0000-4000-8000-000000000004'),'Synthetic','non-member cannot update another profile');

set local role anon;
select throws_ok($test$select * from public.profiles$test$,'42501',null,'anon has no direct grant on profile data');
select throws_ok($test$select * from storage.objects$test$,'42501',null,'anon has no direct grant on private storage objects');
reset role;

select throws_ok(
  $test$insert into public.programs(household_id,profile_id,title) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000099','bad')$test$,
  '23503',null,'composite profile FK rejects mismatched ownership');
select throws_ok(
  $test$insert into public.program_imports(household_id,profile_id,source_id,source_version,checksum) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash'),('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash')$test$,
  '23505',null,'program import idempotency key rejects duplicate import');
select throws_ok(
  $test$update public.program_sessions set name='Changed' where id='10000000-0000-4000-8000-000000000007'$test$,
  '55000','Published versions are immutable','published program session cannot be changed');

select * from finish();
rollback;
