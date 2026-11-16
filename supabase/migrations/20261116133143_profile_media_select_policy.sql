create policy profile_media_select on storage.objects for select to authenticated using (bucket_id='profile-media' and private.can_access_profile_media(name));
