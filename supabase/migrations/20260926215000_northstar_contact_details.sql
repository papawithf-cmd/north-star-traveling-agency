-- Northstar Traveling Agency: keep public contact settings aligned with the displayed contact details.
UPDATE public.site_settings
SET phone = '+254 762 932 660 / +254 140 863 587 / +254 100 922 332',
    whatsapp = '+254 100 922 332',
    email = 'northstaragencyweb@gmail.com'
WHERE true;
