
CREATE TYPE public.app_role AS ENUM ('admin','editor','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  -- first user becomes admin
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  icon text,
  display_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMPANIES
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo text,
  description text,
  country text, city text, address text,
  website text, email text, phone text, whatsapp text,
  industry text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "admins manage companies" ON public.companies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OPPORTUNITIES
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  description text,
  responsibilities text,
  requirements text,
  qualifications text,
  benefits text,
  min_age int, max_age int,
  education text, experience text, skills text, languages text,
  certificates text, physical_requirements text, drivers_license text, passport_required text,
  other_requirements text,
  contract_duration text, permanence text, probation text,
  location text, country text, city text, workplace text,
  employment_type text, duration text,
  salary text, currency text,
  vacancies int,
  start_date date, deadline date,
  application_method text, application_url text, application_email text,
  application_phone text, application_whatsapp text, application_instructions text,
  required_documents text,
  contact_person text, contact_phone text, contact_whatsapp text, contact_email text, contact_website text,
  status text NOT NULL DEFAULT 'draft',
  rejection_reason text,
  featured boolean NOT NULL DEFAULT false,
  urgent boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  created_by uuid, approved_by uuid,
  approved_at timestamptz, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX opportunities_status_idx ON public.opportunities(status);
CREATE INDEX opportunities_category_idx ON public.opportunities(category_id);
CREATE INDEX opportunities_company_idx ON public.opportunities(company_id);
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published opportunities" ON public.opportunities FOR SELECT
  USING (status IN ('published','approved','featured','urgent'));
CREATE POLICY "admins manage opportunities" ON public.opportunities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER opportunities_updated BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- IMAGES
CREATE TABLE public.opportunity_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX opportunity_images_opp_idx ON public.opportunity_images(opportunity_id);
GRANT SELECT ON public.opportunity_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_images TO authenticated;
GRANT ALL ON public.opportunity_images TO service_role;
ALTER TABLE public.opportunity_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read images" ON public.opportunity_images FOR SELECT USING (true);
CREATE POLICY "admins manage images" ON public.opportunity_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- NOTES (admin only)
CREATE TABLE public.opportunity_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  admin_id uuid,
  note text NOT NULL,
  priority text DEFAULT 'normal',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_notes TO authenticated;
GRANT ALL ON public.opportunity_notes TO service_role;
ALTER TABLE public.opportunity_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage notes" ON public.opportunity_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER notes_updated BEFORE UPDATE ON public.opportunity_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ENQUIRIES
CREATE TABLE public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text,
  subject text, message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_enquiries TO authenticated;
GRANT ALL ON public.contact_enquiries TO service_role;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit enquiry" ON public.contact_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage enquiries" ON public.contact_enquiries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER enquiries_updated BEFORE UPDATE ON public.contact_enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SITE SETTINGS (single row)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'SkyBridge Careers',
  tagline text,
  phone text, whatsapp text, email text,
  address text, business_hours text,
  contact_person text,
  facebook text, twitter text, instagram text, linkedin text,
  about_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SEED
INSERT INTO public.site_settings (site_name, tagline, about_text)
VALUES ('SkyBridge Careers','Verified employment opportunities worldwide','SkyBridge Careers connects skilled professionals with verified employers across aviation, caregiving, security, courier and delivery industries.');

INSERT INTO public.categories (name, slug, description, display_order) VALUES
 ('Air Hostess / Cabin Crew','air-hostess','Inflight cabin crew roles with regional and international airlines.',1),
 ('Airmen','airmen','Aviation technical and aircrew positions.',2),
 ('Ground Crew','ground-crew','Airport ground handling, ramp and passenger service roles.',3),
 ('Caregivers','caregivers','Professional caregiving and home support opportunities.',4),
 ('Security','security','Corporate, residential and event security positions.',5),
 ('Private Courier','private-courier','Independent and private courier assignments.',6),
 ('Delivery Companies','delivery','Logistics and last-mile delivery opportunities.',7);

INSERT INTO public.companies (name, slug, description, country, city, industry, verified) VALUES
 ('Horizon Air Services','horizon-air-services','Regional airline services provider.','United Arab Emirates','Dubai','Aviation',true),
 ('CarePlus Group','careplus-group','Home care and assisted living provider.','United Kingdom','Manchester','Healthcare',true);

INSERT INTO public.opportunities (title, slug, category_id, company_id, description, responsibilities, location, country, city, employment_type, duration, salary, currency, vacancies, deadline, status, featured, verified, application_method, published_at)
SELECT 'Cabin Crew — International Routes','cabin-crew-international-routes', c.id, co.id,
 'Join a growing international cabin crew team serving long-haul and regional routes.',
 'Ensure passenger safety and comfort; deliver inflight service; complete pre-flight checks.',
 'Dubai International Airport','United Arab Emirates','Dubai','Full-time','2 year contract','2,500 - 3,200','USD',12, (now() + interval '45 days')::date,'published',true,true,'email', now()
FROM public.categories c, public.companies co WHERE c.slug='air-hostess' AND co.slug='horizon-air-services';

INSERT INTO public.opportunities (title, slug, category_id, company_id, description, responsibilities, location, country, city, employment_type, duration, salary, currency, vacancies, deadline, status, featured, urgent, verified, application_method, published_at)
SELECT 'Live-in Caregiver','live-in-caregiver', c.id, co.id,
 'Provide compassionate daily support to elderly clients in a live-in arrangement.',
 'Personal care assistance; medication reminders; meal preparation; companionship.',
 'Manchester','United Kingdom','Manchester','Full-time','12 months','1,900 - 2,300','GBP',6,(now() + interval '30 days')::date,'published',true,true,true,'email', now()
FROM public.categories c, public.companies co WHERE c.slug='caregivers' AND co.slug='careplus-group';
