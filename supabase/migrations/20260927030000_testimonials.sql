-- Northstar Traveling Agency: administrator-managed testimonials.

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  published boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX testimonials_published_idx
  ON public.testimonials(published, display_order, created_at);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published testimonials"
  ON public.testimonials
  FOR SELECT
  USING (published = true);

CREATE POLICY "admins manage testimonials"
  ON public.testimonials
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER testimonials_updated
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.testimonials (name, location, quote, rating, published, display_order, is_demo)
VALUES
  ('Sarah M.', 'Nairobi', 'Northstar Traveling Agency helped me understand the application process clearly and prepared me for my next career step.', 5, true, 1, true),
  ('David K.', 'Mombasa', 'The opportunity details were easy to review, and the application instructions were straightforward.', 5, true, 2, true),
  ('Grace W.', 'Nakuru', 'A clean and helpful experience for finding international employment opportunities and checking requirements.', 5, true, 3, true);
