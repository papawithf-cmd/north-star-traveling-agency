-- Ensure the image bucket used by Northstar opportunities is publicly readable.
-- This is intentionally idempotent so it can safely be applied to an existing project.

update storage.buckets
set public = true
where id = 'site-images';

drop policy if exists "site-images public read" on storage.objects;
create policy "site-images public read"
  on storage.objects
  for select
  using (bucket_id = 'site-images');

drop policy if exists "site-images admin write" on storage.objects;
create policy "site-images admin write"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'site-images'
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "site-images admin update" on storage.objects;
create policy "site-images admin update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'site-images'
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "site-images admin delete" on storage.objects;
create policy "site-images admin delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'site-images'
    and public.has_role(auth.uid(), 'admin')
  );
