create policy "admins read site images"
on storage.objects for select to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

create policy "admins upload site images"
on storage.objects for insert to authenticated
with check (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

create policy "admins update site images"
on storage.objects for update to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

create policy "admins delete site images"
on storage.objects for delete to authenticated
using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));