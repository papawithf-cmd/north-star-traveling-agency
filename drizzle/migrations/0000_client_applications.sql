
CREATE TYPE public.application_status AS ENUM ('pending','under_review','approved','rejected');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  job_category text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  nationality text NOT NULL,
  date_of_birth date,
  country_of_interest text NOT NULL,
  passport_status text,
  cv_path text,
  cv_name text,
  qualifications text,
  work_experience text,
  additional_info text,
  status public.application_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX applications_user_idx ON public.applications(user_id);
CREATE INDEX applications_status_idx ON public.applications(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients read own applications" ON public.applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "clients create own applications" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients update own pending applications" ON public.applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage applications" ON public.applications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.protect_application_review_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    NEW.status := OLD.status;
    NEW.admin_notes := OLD.admin_notes;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.protect_application_review_fields() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER applications_protect BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.protect_application_review_fields();
