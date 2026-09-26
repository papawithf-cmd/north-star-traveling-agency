
CREATE POLICY "clients upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "clients read own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'application-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "clients delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
