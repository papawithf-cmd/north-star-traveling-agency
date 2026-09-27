-- Company logos are intentionally explicit and verified.
-- No logo is ever inferred from a company name.
--
-- The seven logo URLs below were checked against the companies' official
-- websites / official brand-asset sources on 2026-09-27.
-- Horizon Air Services is intentionally left unverified because the current
-- database record (UAE aviation) does not match the verified Horizon Air
-- Services entity we found, so assigning a logo would risk showing a false logo.

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

-- Amazon Poland — Amazon 2024 logo.
UPDATE public.companies
SET logo = 'https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_2024.svg',
    logo_verified = true
WHERE slug = 'amazon-poland';

-- DHL Supply Chain Poland — DHL Group / DHL Supply Chain mark.
UPDATE public.companies
SET logo = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dhl-logo.svg',
    logo_verified = true
WHERE slug = 'dhl-supply-chain-poland';

-- Emirates Group — Emirates logo.
UPDATE public.companies
SET logo = 'https://commons.wikimedia.org/wiki/Special:FilePath/Emirates_logo.svg',
    logo_verified = true
WHERE slug = 'emirates-group';

-- Etihad Airways — Etihad Airways logo.
UPDATE public.companies
SET logo = 'https://commons.wikimedia.org/wiki/Special:FilePath/Etihad-airways-logo.svg',
    logo_verified = true
WHERE slug = 'etihad-airways';

-- Marriott International — Marriott International logo.
UPDATE public.companies
SET logo = 'https://commons.wikimedia.org/wiki/Special:FilePath/Marriott%20International.svg',
    logo_verified = true
WHERE slug = 'marriott-international';

-- Barchester Healthcare — current brand asset from the Barchester brand page.
UPDATE public.companies
SET logo = 'https://cdn.brandfetch.io/idIXel3C5V/theme/light/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1781717913444',
    logo_verified = true
WHERE slug = 'barchester-healthcare';

-- Care Plus Group — direct logo asset hosted by Care Plus Group's official site.
UPDATE public.companies
SET logo = 'https://careplusgroup.org/wp-content/uploads/2020/02/Web-without-tagline.png',
    logo_verified = true
WHERE slug = 'careplus-group';

-- Do not guess Horizon Air Services.
-- It remains unverified until its company identity / official website is
-- confirmed by the admin, so the public site will show a neutral icon.
UPDATE public.companies
SET logo_verified = false
WHERE slug = 'horizon-air-services';
