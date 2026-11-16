-- Synthetic catalog records only; no user, profile, or workout data.
insert into public.exercises(slug,name_fa,name_en,muscle_group,equipment,instructions,is_active)
values
  ('barbell-back-squat','اسکوات هالتر','Barbell Back Squat','legs','barbell',null,true),
  ('barbell-bench-press','پرس سینه هالتر','Barbell Bench Press','chest','barbell',null,true),
  ('deadlift','ددلیفت','Deadlift','posterior_chain','barbell',null,true),
  ('lat-pulldown','لت سیم‌کش','Lat Pulldown','back','cable',null,true),
  ('dumbbell-overhead-press','پرس سرشانه دمبل','Dumbbell Overhead Press','shoulders','dumbbell',null,true),
  ('dumbbell-biceps-curl','جلو بازو دمبل','Dumbbell Biceps Curl','arms','dumbbell',null,true),
  ('cable-triceps-pushdown','پشت بازو سیم‌کش','Cable Triceps Pushdown','arms','cable',null,true),
  ('plank','پلانک','Plank','core','bodyweight',null,true)
on conflict (slug) do nothing;
