-- Company logos are intentionally website-driven and verified.
-- No logo is inferred from a company name.
--
-- The application resolves a logo from the company's stored official website
-- domain. An explicitly stored logo is only used when logo_verified=true.
-- This migration adds the database flag for future/admin verification.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.companies
  DROP CONSTRAINT IF EXISTS companies_logo_verified_requires_logo;

ALTER TABLE public.companies
  ADD CONSTRAINT companies_logo_verified_requires_logo
  CHECK (
    NOT logo_verified
    OR NULLIF(trim(logo), '') IS NOT NULL
  );

COMMENT ON COLUMN public.companies.logo_verified IS
  'True only when the admin has verified that logo belongs to the company represented by this record.';

-- Do not assign a logo by matching a company name. The app resolves the
-- logo from the company's official website domain instead.
