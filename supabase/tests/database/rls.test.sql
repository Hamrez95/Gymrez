begin;
create extension if not exists pgtap with schema extensions;
select plan(4);
insert into auth.users(id,aud,role,email,encrypted_password,raw_app_meta_data,raw_user_meta_data)
values ('a0000000-0000-4000-8000-000000000001','authenticated','authenticated','a@test.invalid','x','{}','{}'),
       ('b0000000-0000-4000-8000-000000000002','authenticated','authenticated','b@test.invalid','x','{}','{}')
on conflict(id) do nothing;
insert into public.households(id,name) values ('c0000000-0000-4000-8000-000000000003','test household');
insert into public.household_members(household_id,user_id) values ('c0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001');
insert into public.profiles(id,household_id,display_name) values ('d0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000003','Synthetic');

set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select is((select count(*)::int from public.profiles),1,'member sees profile in household');
select set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000002',true);
select is((select count(*)::int from public.profiles),0,'non-member sees no profiles');
reset role;
select throws_ok($$insert into public.programs(household_id,profile_id,title) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000099','bad')$$,'23503',null,'composite profile FK rejects mismatched ownership');
select throws_ok($$insert into public.program_imports(household_id,profile_id,source_id,source_version,checksum) values ('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash'),('c0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000004','id','1','hash')$$,'23505',null,'program import idempotency key rejects duplicate import');
select * from finish();
rollback;
