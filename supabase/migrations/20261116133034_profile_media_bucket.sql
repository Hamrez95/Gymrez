-- Private profile uploads use <household UUID>/<profile UUID>/<file> paths.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-media','profile-media',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
