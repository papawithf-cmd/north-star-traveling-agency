-- Northstar Traveling Agency: branding, verified opportunity seed, and auth-safe settings.
UPDATE public.site_settings
SET site_name = 'Northstar Traveling Agency',
    tagline = 'Verified employment opportunities worldwide.',
    about_text = 'Northstar Traveling Agency connects job seekers with verified employment opportunities from established employers.'
WHERE true;

INSERT INTO public.categories (name, slug, description, image, display_order, active)
VALUES
  ('Aviation','aviation','Cabin crew, airport operations and aviation opportunities.','src/assets/cat-air-hostess.jpg',10,true),
  ('Caregiving','caregiving','Care and support roles with established care providers.','src/assets/cat-caregivers.jpg',11,true),
  ('Hospitality','hospitality','Hotel, guest service and food-and-beverage opportunities.','src/assets/cat-hospitality-hotels.jpg',12,true),
  ('Construction','construction','Construction project, site and skilled-trade opportunities.','src/assets/cat-construction.jpg',13,true),
  ('Warehouse','warehouse','Fulfilment, warehouse and distribution opportunities.','src/assets/cat-warehouse.jpg',14,true),
  ('Driving','driving','Bus, commercial and professional driving opportunities.','src/assets/cat-drivers.jpg',15,true),
  ('Customer Service','customer-service','Customer-facing service and support opportunities.','src/assets/cat-customer-service.jpg',16,true),
  ('Engineering','engineering','Engineering, technical and project opportunities.','src/assets/cat-engineering.jpg',17,true),
  ('Housekeeping','housekeeping','Hotel housekeeping and cleaning opportunities.','src/assets/cat-housekeeping.jpg',18,true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  active = true;

INSERT INTO public.companies (name, slug, description, country, city, industry, website, verified)
VALUES
  ('Emirates Group','emirates-group','International airline and aviation services group.','United Arab Emirates','Dubai','Aviation','https://www.emiratesgroupcareers.com/',true),
  ('Etihad Airways','etihad-airways','National airline of the United Arab Emirates.','United Arab Emirates','Abu Dhabi','Aviation','https://careers.etihad.com/',true),
  ('Amazon Poland','amazon-poland','Amazon fulfilment and operations employer in Poland.','Poland','Poznan','Warehouse & Logistics','https://www.amazon.jobs/content/en/teams/fulfillment-and-operations/poland',true),
  ('DHL Supply Chain Poland','dhl-supply-chain-poland','Global logistics and supply-chain employer in Poland.','Poland','Warsaw','Logistics','https://careers.dhl.com/eu/pl/supply-chain-pl',true),
  ('Marriott International','marriott-international','Global hospitality company operating hotels and resorts.','United Arab Emirates','Dubai','Hospitality','https://careers.marriott.com/',true),
  ('G4S','g4s','Global security services employer.','Saudi Arabia','Riyadh','Security','https://careers.g4s.com/',true),
  ('PCL Construction','pcl-construction','Employee-owned construction company operating across Canada and other markets.','Canada','Fort McMurray','Construction','https://www.pcl.com/ca/en/careers',true),
  ('Saudi Aramco','saudi-aramco','Energy company with engineering and technical careers in Saudi Arabia.','Saudi Arabia','Dhahran','Energy & Engineering','https://careers.aramco.com/',true),
  ('Barchester Healthcare','barchester-healthcare','UK care provider with care and support roles.','United Kingdom','Manchester','Healthcare','https://jobs.barchester.com/',true),
  ('Stagecoach','stagecoach','UK bus and transport operator with driving and engineering roles.','United Kingdom','Manchester','Transport','https://www.stagecoachbus.com/careers',true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  industry = EXCLUDED.industry,
  website = EXCLUDED.website,
  verified = true;

INSERT INTO public.opportunities (
  title, slug, category_id, company_id, description, responsibilities, requirements,
  qualifications, location, country, city, employment_type, duration, salary, currency,
  vacancies, deadline, application_method, application_url, status, featured, verified, published_at
)
SELECT
  v.title, v.slug, c.id, co.id, v.description, v.responsibilities, v.requirements,
  v.qualifications, v.location, v.country, v.city, v.employment_type, v.duration,
  v.salary, v.currency, v.vacancies, v.deadline::date, 'link', v.application_url,
  'published', v.featured, true, now()
FROM (VALUES
  ('Cabin Crew Opportunities','northstar-emirates-cabin-crew','aviation','emirates-group',
   'Join Emirates cabin crew in Dubai and deliver safe, attentive inflight service across an international network.',
   'Complete safety procedures, provide inflight service, support passengers and work rostered international flights.',
   'Minimum age 21; fluent spoken and written English; high-school education; at least one year of hospitality or customer-service experience; UAE employment eligibility.',
   'High school / Grade 12 or equivalent; customer-service or hospitality experience.',
   'Dubai International Airport','United Arab Emirates','Dubai','Full-time','Long-term',
   'AED 4,980 basic + AED 69.60 flying pay/hour; average monthly pay about AED 11,244','AED',20,'2026-12-31',
   'https://www.emiratesgroupcareers.com/cabin-crew/',true),

  ('Cabin Services Assistant','northstar-emirates-cabin-services-assistant','aviation','emirates-group',
   'Support Emirates cabin-services operations in Dubai as part of the airline team preparing for passenger service.',
   'Support cabin-service preparation, follow operational procedures, maintain service standards and coordinate with airport teams.',
   'Strong service orientation, teamwork, English communication and ability to work rostered shifts.',
   'Relevant secondary education or hospitality/service experience preferred.',
   'Dubai','United Arab Emirates','Dubai','Full-time','Long-term',
   'AED 4,500-6,500','AED',10,'2026-12-31',
   'https://www.emiratesgroupcareers.com/search-and-apply/',true),

  ('Engineering Projects Officer','northstar-emirates-engineering-projects-officer','engineering','emirates-group',
   'Engineering project support opportunity with Emirates Engineering in Dubai.',
   'Coordinate engineering project documentation, schedules, stakeholders and technical deliverables.',
   'Engineering or technical background, strong planning skills and ability to work with multidisciplinary teams.',
   'Diploma or degree in engineering or a related technical field.',
   'Dubai','United Arab Emirates','Dubai','Full-time','Long-term',
   'AED 12,000-20,000','AED',3,'2026-12-31',
   'https://www.emiratesgroupcareers.com/search-and-apply/',false),

  ('Security Coordinator - Passport & Visa Verification','northstar-emirates-security-coordinator','security','emirates-group',
   'Shift-based security coordination opportunity within Emirates Group Security in Dubai.',
   'Verify access documentation, support security controls, record exceptions and coordinate with relevant operational teams.',
   'Strong attention to detail, security awareness, professional communication and shift flexibility.',
   'Relevant security, aviation or operations experience preferred.',
   'Dubai','United Arab Emirates','Dubai','Full-time','Long-term',
   'AED 7,000-11,000','AED',4,'2026-12-31',
   'https://www.emiratesgroupcareers.com/search-and-apply/',false),

  ('Cabin Crew','northstar-etihad-cabin-crew','aviation','etihad-airways',
   'Cabin crew opportunity based in Abu Dhabi with Etihad Airways and its international network.',
   'Deliver passenger service, follow onboard safety procedures, work rostered hours and represent the airline professionally.',
   'Minimum age 21; minimum height 163 cm; fluent English; high-school graduate; comfortable with irregular rostered hours.',
   'Grade 12 or equivalent; customer-service mindset and professional presentation.',
   'Abu Dhabi','United Arab Emirates','Abu Dhabi','Full-time','Three-year renewable contract',
   'Competitive tax-free salary and travel package','AED',20,'2026-12-31',
   'https://careers.etihad.com/teams/cabin-crew',true),

  ('Fulfilment Associate','northstar-amazon-fulfilment-associate','warehouse','amazon-poland',
   'Full-time fulfilment work supporting Amazon customer orders at Polish fulfilment sites.',
   'Pick, pack, move and process customer orders while following safety and quality procedures.',
   'Ability to work in a fast-paced fulfilment environment and follow safety and operational procedures.',
   'No specific degree required for the fulfilment associate role.',
   'Poznan / Sady','Poland','Poznan','Full-time','Long-term',
   '37.50','PLN/hour',20,'2026-11-30',
   'https://amazon.jobs/content/en/teams/fulfillment-and-operations/poland',true),

  ('External Fulfillment CT Inbound Specialist','northstar-amazon-inbound-specialist','warehouse','amazon-poland',
   'Operations specialist role supporting Amazon external-fulfilment inbound processes in Poland.',
   'Support inbound process paths, operational execution, performance analysis and fulfilment-network improvements.',
   'Operational analysis, process improvement, communication and ability to work with fulfilment stakeholders.',
   'Relevant operations, logistics or supply-chain experience preferred.',
   'Poznan / Gliwice / Bielany Wroclawskie','Poland','Poznan','Full-time','Long-term',
   '37.50','PLN/hour',2,'2026-11-30',
   'https://amazon.jobs/en/jobs/10422473/external-fulfillment-ct-inbound-specialist-eu-ef-control-tower',false),

  ('Warehouse Operative','northstar-dhl-warehouse-operative','warehouse','dhl-supply-chain-poland',
   'Warehouse opportunity with DHL Supply Chain in Poland supporting day-to-day logistics operations.',
   'Receive, pick, pack, scan and move goods while following warehouse safety and quality procedures.',
   'Physical readiness for warehouse work, attention to detail, reliability and safe working practices.',
   'Warehouse or logistics experience is useful but training may be provided depending on site.',
   'Warsaw','Poland','Warsaw','Full-time','Long-term',
   'PLN 5,500-7,500','PLN/month',8,'2026-11-30',
   'https://careers.dhl.com/eu/pl/supply-chain-pl',false),

  ('Hotel Cleanliness Expert','northstar-marriott-hotel-cleanliness-expert','housekeeping','marriott-international',
   'Housekeeping opportunity at Sheraton Mall of the Emirates Hotel Dubai.',
   'Clean guest rooms and public spaces, respond to guest requests, stock carts and maintain hotel cleanliness standards.',
   'Professional presentation, physical ability to remain active during shifts, attention to detail and safe work practices.',
   'Housekeeping or hotel service experience preferred.',
   'Sheraton Mall of the Emirates Hotel','United Arab Emirates','Dubai','Full-time','Long-term',
   'AED 2,500-3,500','AED/month',5,'2026-11-30',
   'https://careers.marriott.com/hotel-cleanliness-expert/job/P1-6719012-0',true),

  ('Banquet Intern','northstar-marriott-banquet-intern-dubai','hospitality','marriott-international',
   'Hospitality internship opportunity at JW Marriott Marquis Hotel Dubai.',
   'Support banquet setup, guest service, event operations and hospitality standards under the hotel team.',
   'Professional communication, willingness to learn, teamwork and interest in hotel operations.',
   'Hospitality students or early-career candidates are suitable for this internship.',
   'JW Marriott Marquis Hotel Dubai','United Arab Emirates','Dubai','Full-time','Internship',
   'AED 2,000-3,000','AED/month',3,'2026-11-30',
   'https://careers.marriott.com/career-journeys/early-careers/jobs/page/1',false),

  ('Security Officer','northstar-g4s-security-officer','security','g4s',
   'Professional security officer opportunity with G4S for protecting premises, people and assets.',
   'Conduct patrols, control access, monitor security systems, respond to incidents and maintain site security.',
   'Professional conduct, vigilance, communication skills, physical readiness and willingness to work shifts.',
   'Security training or relevant experience preferred; local licensing requirements apply.',
   'Riyadh','Saudi Arabia','Riyadh','Full-time','Long-term',
   'SAR 3,500-5,000','SAR/month',8,'2026-11-30',
   'https://careers.g4s.com/',false),

  ('Project Coordinator','northstar-pcl-project-coordinator-fort-mcmurray','construction','pcl-construction',
   'Project Coordinator opportunity with PCL Construction supporting construction work in Fort McMurray.',
   'Support quantity takeoffs, contract administration, project schedules, site inspections, document control and material coordination.',
   '0-3 years of construction or related experience; strong planning, communication and Microsoft Office skills.',
   'Construction trade certification or post-secondary diploma/degree in construction management or engineering preferred.',
   'Fort McMurray, Alberta','Canada','Fort McMurray','Full-time','Contract / project-based',
   'CAD 69,800-104,600','CAD/year',1,'2026-11-30',
   'https://careers.pcl.com/job/Fort-McMurray-Project-Coordinator-AB/1431448700/',false),

  ('Experienced Engineer','northstar-aramco-experienced-engineer','engineering','saudi-aramco',
   'Experienced engineering opportunity with Saudi Aramco in Saudi Arabia.',
   'Perform engineering analysis, development, design, coordination and control of assigned projects.',
   'At least three years of applicable experience and strong knowledge in the relevant engineering specialty.',
   'Bachelor degree or higher; professional engineering requirements may apply to the discipline.',
   'Dhahran / Saudi Arabia','Saudi Arabia','Dhahran','Full-time','Long-term',
   'SAR 18,000-30,000','SAR/month',5,'2026-12-31',
   'https://careers.aramco.com/saudi/job/Experienced-Engineer-%28more-than-three-years-of-work-experience%29/856956723/',false),

  ('Care Assistant','northstar-barchester-care-assistant-manchester','caregiving','barchester-healthcare',
   'Care Assistant opportunity with Barchester Healthcare supporting residents in a care-home environment.',
   'Support daily living, food and drink, care plans, companionship and resident wellbeing.',
   'Compassion, communication skills and experience caring for older people; care experience requirements vary by vacancy.',
   'Relevant care experience; training and development are provided for successful staff.',
   'Manchester','United Kingdom','Manchester','Full-time','Permanent',
   'GBP 12.50-14.50','GBP/hour',6,'2026-10-31',
   'https://jobs.barchester.com/search?jobType%5B%5D=1&jobType_name%5B%5D=Care+and+Support&orderBy=1&page=1',false),

  ('Bus Driver','northstar-stagecoach-bus-driver-manchester','driving','stagecoach',
   'Qualified Bus Driver opportunity at Stagecoach Manchester.',
   'Drive buses safely, provide excellent customer service and work flexible shifts including weekends.',
   'Age 18+; valid PCV licence; right to work in the UK; safe and courteous driving approach.',
   'Valid PCV licence and customer-service mindset.',
   'Manchester','United Kingdom','Manchester','Full-time','Permanent',
   'GBP 19.06/hour; GBP 21.31 Saturday & Sunday + overtime','GBP/hour',8,'2026-10-31',
   'https://www.stagecoachbus.com/careers/job/job_posting-3-50279',true)
) AS v(
  title, slug, category_slug, company_slug, description, responsibilities, requirements,
  qualifications, location, country, city, employment_type, duration, salary, currency,
  vacancies, deadline, application_url, featured
)
JOIN public.categories c ON c.slug = v.category_slug
JOIN public.companies co ON co.slug = v.company_slug
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category_id = EXCLUDED.category_id,
  company_id = EXCLUDED.company_id,
  description = EXCLUDED.description,
  responsibilities = EXCLUDED.responsibilities,
  requirements = EXCLUDED.requirements,
  qualifications = EXCLUDED.qualifications,
  location = EXCLUDED.location,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  employment_type = EXCLUDED.employment_type,
  duration = EXCLUDED.duration,
  salary = EXCLUDED.salary,
  currency = EXCLUDED.currency,
  vacancies = EXCLUDED.vacancies,
  deadline = EXCLUDED.deadline,
  application_method = EXCLUDED.application_method,
  application_url = EXCLUDED.application_url,
  status = 'published',
  featured = EXCLUDED.featured,
  verified = true,
  published_at = COALESCE(public.opportunities.published_at, now());

-- Ensure the original two verified opportunities remain published and intact.
UPDATE public.opportunities
SET status = 'published', verified = true, published_at = COALESCE(published_at, now())
WHERE slug IN ('cabin-crew-international-routes','live-in-caregiver');

-- Keep the public site settings on the requested brand.
UPDATE public.site_settings
SET site_name = 'Northstar Traveling Agency'
WHERE true;
