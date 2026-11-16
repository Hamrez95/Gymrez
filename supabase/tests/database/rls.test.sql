begin;
create extension if not exists pgtap with schema extensions;
select plan(5);
insert into auth.users(id,aud,role,email,encrypted_password,raw_app_meta_data,raw_user_meta_data)
values ('a0000000-0000-4000-8000-000000000001','authenticated','authenticated','a@test.invalid','x','{}','{}'),
       ('b0000000-0000-4000-8000-000000000002','authenticated','authenticated','b@test.invalid','x','{}','{}')
on conflict(id) do nothing;
insert into public.households(id,name) values ('c0000000-0000-4000-8000-000000000003','test household');
insert into public.household_members(household_id,user_id) values ('c0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001');
insert into public.profiles(id,household_id,display_name) values ('d0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000003','Synthetic');
insert into public.programs(id,household_id,profile_id,title)
values ('e0000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','Version test');
insert into public.program_versions(id,household_id,profile_id,program_id,version_no,title_snapshot)
values ('f0000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000005',1,'Version test');
insert into public.program_sessions(id,household_id,profile_id,program_id,program_version_id,name,position)
values ('10000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000005','f0000000-0000-4000-8000-000000000006','Session',0);
update public.program_versions set published_at=now() where id='f0000000-0000-4000-8000-000000000006';

set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select is((select count(*)::int from public.profiles),1,'member sees profile in household');
select set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000002',true);
select is((select count(*)::int from public.profiles),0,'non-member sees no profiles');
reset role;
select throws_ok($$insert into public.programs(household_id,profile_id,title) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000099','bad')$$,'23503',null,'composite profile FK rejects mismatched ownership');
select throws_ok($insert into public.program_imports(household_id,profile_id,source_id,source_version,checksum) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash'),('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash')$,'23505',null,'program import idempotency key rejects duplicate import');
select throws_ok($update public.program_sessions set name='Changed' where id='10000000-0000-4000-8000-000000000007'$,'55000','Published versions are immutable','published program session cannot be changed');
select * from finish();
rollback;
