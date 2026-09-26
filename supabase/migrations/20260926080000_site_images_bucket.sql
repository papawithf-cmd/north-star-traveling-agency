-- Public bucket for admin-uploaded opportunity & category images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images','site-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "site-images public read" on storage.objects;
create policy "site-images public read" on storage.objects
  for select using (bucket_id = 'site-images');

drop policy if exists "site-images admin write" on storage.objects;
create policy "site-images admin write" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "site-images admin update" on storage.objects;
create policy "site-images admin update" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "site-images admin delete" on storage.objects;
create policy "site-images admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));
