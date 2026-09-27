import { createServerFn } from "@tanstack/react-start";

// Production restore path: invoked before public opportunity reads. Live browser verification harness corrected.

const CATEGORIES = [
  ["Aviation", "aviation", "Cabin crew, airport operations and aviation opportunities.", "src/assets/cat-air-hostess.jpg", 10],
  ["Caregiving", "caregiving", "Care and support roles with established care providers.", "src/assets/cat-caregivers.jpg", 11],
  ["Hospitality", "hospitality", "Hotel, guest service and food-and-beverage opportunities.", "src/assets/cat-hospitality-hotels.jpg", 12],
  ["Construction", "construction", "Construction project, site and skilled-trade opportunities.", "src/assets/cat-construction.jpg", 13],
  ["Warehouse", "warehouse", "Fulfilment, warehouse and distribution opportunities.", "src/assets/cat-warehouse.jpg", 14],
  ["Driving", "driving", "Bus, commercial and professional driving opportunities.", "src/assets/cat-drivers.jpg", 15],
  ["Customer Service", "customer-service", "Customer-facing service and support opportunities.", "src/assets/cat-customer-service.jpg", 16],
  ["Engineering", "engineering", "Engineering, technical and project opportunities.", "src/assets/cat-engineering.jpg", 17],
  ["Housekeeping", "housekeeping", "Hotel housekeeping and cleaning opportunities.", "src/assets/cat-housekeeping.jpg", 18],
] as const;

const COMPANIES = [
  ["Horizon Air Services","horizon-air-services","Regional airline services provider.","United Arab Emirates","Dubai","Aviation"],
  ["CarePlus Group","careplus-group","Home care and assisted living provider.","United Kingdom","Manchester","Healthcare"],
  ["Emirates Group","emirates-group","International airline and aviation services group.","United Arab Emirates","Dubai","Aviation"],
  ["Etihad Airways","etihad-airways","National airline of the United Arab Emirates.","United Arab Emirates","Abu Dhabi","Aviation"],
  ["Amazon Poland","amazon-poland","Amazon fulfilment and operations employer in Poland.","Poland","Poznan","Warehouse & Logistics"],
  ["DHL Supply Chain Poland","dhl-supply-chain-poland","Global logistics and supply-chain employer in Poland.","Poland","Warsaw","Logistics"],
  ["Marriott International","marriott-international","Global hospitality company operating hotels and resorts.","United Arab Emirates","Dubai","Hospitality"],
  ["G4S","g4s","Global security services employer.","Saudi Arabia","Riyadh","Security"],
  ["PCL Construction","pcl-construction","Employee-owned construction company operating across Canada and other markets.","Canada","Fort McMurray","Construction"],
  ["Saudi Aramco","saudi-aramco","Energy company with engineering and technical careers in Saudi Arabia.","Saudi Arabia","Dhahran","Energy & Engineering"],
  ["Barchester Healthcare","barchester-healthcare","UK care provider with care and support roles.","United Kingdom","Manchester","Healthcare"],
  ["Stagecoach","stagecoach","UK bus and transport operator with driving and engineering roles.","United Kingdom","Manchester","Transport"],
] as const;

const OPPORTUNITIES = [
  {
    title:"Cabin Crew — International Routes", slug:"cabin-crew-international-routes", category:"air-hostess", company:"horizon-air-services",
    description:"Join a growing international cabin crew team serving long-haul and regional routes.",
    responsibilities:"Ensure passenger safety and comfort; deliver inflight service; complete pre-flight checks.",
    location:"Dubai International Airport", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"2 year contract",
    salary:"2,500 - 3,200", currency:"USD", vacancies:12, application_method:"email", featured:true, urgent:false, application_url:null
  },
  {
    title:"Live-in Caregiver", slug:"live-in-caregiver", category:"caregivers", company:"careplus-group",
    description:"Provide compassionate daily support to elderly clients in a live-in arrangement.",
    responsibilities:"Personal care assistance; medication reminders; meal preparation; companionship.",
    location:"Manchester", country:"United Kingdom", city:"Manchester", employment_type:"Full-time", duration:"12 months",
    salary:"1,900 - 2,300", currency:"GBP", vacancies:6, application_method:"email", featured:true, urgent:true, application_url:null
  },
  {
    title:"Cabin Crew Opportunities", slug:"northstar-emirates-cabin-crew", category:"aviation", company:"emirates-group",
    description:"Join Emirates cabin crew in Dubai and deliver safe, attentive inflight service across an international network.",
    responsibilities:"Complete safety procedures, provide inflight service, support passengers and work rostered international flights.",
    requirements:"Minimum age 21; fluent spoken and written English; high-school education; at least one year of hospitality or customer-service experience; UAE employment eligibility.",
    qualifications:"High school / Grade 12 or equivalent; customer-service or hospitality experience.",
    location:"Dubai International Airport", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Long-term",
    salary:"AED 4,980 basic + AED 69.60 flying pay/hour; average monthly pay about AED 11,244", currency:"AED", vacancies:20,
    application_method:"link", application_url:"https://www.emiratesgroupcareers.com/cabin-crew/", featured:true, urgent:false
  },
  {
    title:"Cabin Services Assistant", slug:"northstar-emirates-cabin-services-assistant", category:"aviation", company:"emirates-group",
    description:"Support Emirates cabin-services operations in Dubai as part of the airline team preparing for passenger service.",
    responsibilities:"Support cabin-service preparation, follow operational procedures, maintain service standards and coordinate with airport teams.",
    requirements:"Strong service orientation, teamwork, English communication and ability to work rostered shifts.",
    qualifications:"Relevant secondary education or hospitality/service experience preferred.",
    location:"Dubai", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Long-term",
    salary:"AED 4,500-6,500", currency:"AED", vacancies:10, application_method:"link",
    application_url:"https://www.emiratesgroupcareers.com/search-and-apply/", featured:true, urgent:false
  },
  {
    title:"Engineering Projects Officer", slug:"northstar-emirates-engineering-projects-officer", category:"engineering", company:"emirates-group",
    description:"Engineering project support opportunity with Emirates Engineering in Dubai.",
    responsibilities:"Coordinate engineering project documentation, schedules, stakeholders and technical deliverables.",
    requirements:"Engineering or technical background, strong planning skills and ability to work with multidisciplinary teams.",
    qualifications:"Diploma or degree in engineering or a related technical field.",
    location:"Dubai", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Long-term",
    salary:"AED 12,000-20,000", currency:"AED", vacancies:3, application_method:"link",
    application_url:"https://www.emiratesgroupcareers.com/search-and-apply/", featured:false, urgent:false
  },
  {
    title:"Security Coordinator - Passport & Visa Verification", slug:"northstar-emirates-security-coordinator", category:"security", company:"emirates-group",
    description:"Shift-based security coordination opportunity within Emirates Group Security in Dubai.",
    responsibilities:"Verify access documentation, support security controls, record exceptions and coordinate with relevant operational teams.",
    requirements:"Strong attention to detail, security awareness, professional communication and shift flexibility.",
    qualifications:"Relevant security, aviation or operations experience preferred.",
    location:"Dubai", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Long-term",
    salary:"AED 7,000-11,000", currency:"AED", vacancies:4, application_method:"link",
    application_url:"https://www.emiratesgroupcareers.com/search-and-apply/", featured:false, urgent:false
  },
  {
    title:"Cabin Crew", slug:"northstar-etihad-cabin-crew", category:"aviation", company:"etihad-airways",
    description:"Cabin crew opportunity based in Abu Dhabi with Etihad Airways and its international network.",
    responsibilities:"Deliver passenger service, follow onboard safety procedures, work rostered hours and represent the airline professionally.",
    requirements:"Minimum age 21; minimum height 163 cm; fluent English; high-school graduate; comfortable with irregular rostered hours.",
    qualifications:"Grade 12 or equivalent; customer-service mindset and professional presentation.",
    location:"Abu Dhabi", country:"United Arab Emirates", city:"Abu Dhabi", employment_type:"Full-time", duration:"Three-year renewable contract",
    salary:"Competitive tax-free salary and travel package", currency:"AED", vacancies:20, application_method:"link",
    application_url:"https://careers.etihad.com/teams/cabin-crew", featured:true, urgent:false
  },
  {
    title:"Fulfilment Associate", slug:"northstar-amazon-fulfilment-associate", category:"warehouse", company:"amazon-poland",
    description:"Full-time fulfilment work supporting Amazon customer orders at Polish fulfilment sites.",
    responsibilities:"Pick, pack, move and process customer orders while following safety and quality procedures.",
    requirements:"Ability to work in a fast-paced fulfilment environment and follow safety and operational procedures.",
    qualifications:"No specific degree required for the fulfilment associate role.",
    location:"Poznan / Sady", country:"Poland", city:"Poznan", employment_type:"Full-time", duration:"Long-term",
    salary:"37.50", currency:"PLN/hour", vacancies:20, application_method:"link",
    application_url:"https://amazon.jobs/content/en/teams/fulfillment-and-operations/poland", featured:true, urgent:false
  },
  {
    title:"External Fulfillment CT Inbound Specialist", slug:"northstar-amazon-inbound-specialist", category:"warehouse", company:"amazon-poland",
    description:"Operations specialist role supporting Amazon external-fulfilment inbound processes in Poland.",
    responsibilities:"Support inbound process paths, operational execution, performance analysis and fulfilment-network improvements.",
    requirements:"Operational analysis, process improvement, communication and ability to work with fulfilment stakeholders.",
    qualifications:"Relevant operations, logistics or supply-chain experience preferred.",
    location:"Poznan / Gliwice / Bielany Wroclawskie", country:"Poland", city:"Poznan", employment_type:"Full-time", duration:"Long-term",
    salary:"37.50", currency:"PLN/hour", vacancies:2, application_method:"link",
    application_url:"https://amazon.jobs/en/jobs/10422473/external-fulfillment-ct-inbound-specialist-eu-ef-control-tower", featured:false, urgent:false
  },
  {
    title:"Warehouse Operative", slug:"northstar-dhl-warehouse-operative", category:"warehouse", company:"dhl-supply-chain-poland",
    description:"Warehouse opportunity with DHL Supply Chain in Poland supporting day-to-day logistics operations.",
    responsibilities:"Receive, pick, pack, scan and move goods while following warehouse safety and quality procedures.",
    requirements:"Physical readiness for warehouse work, attention to detail, reliability and safe working practices.",
    qualifications:"Warehouse or logistics experience is useful but training may be provided depending on site.",
    location:"Warsaw", country:"Poland", city:"Warsaw", employment_type:"Full-time", duration:"Long-term",
    salary:"PLN 5,500-7,500", currency:"PLN/month", vacancies:8, application_method:"link",
    application_url:"https://careers.dhl.com/eu/pl/supply-chain-pl", featured:false, urgent:false
  },
  {
    title:"Hotel Cleanliness Expert", slug:"northstar-marriott-hotel-cleanliness-expert", category:"housekeeping", company:"marriott-international",
    description:"Housekeeping opportunity at Sheraton Mall of the Emirates Hotel Dubai.",
    responsibilities:"Clean guest rooms and public spaces, respond to guest requests, stock carts and maintain hotel cleanliness standards.",
    requirements:"Professional presentation, physical ability to remain active during shifts, attention to detail and safe work practices.",
    qualifications:"Housekeeping or hotel service experience preferred.",
    location:"Sheraton Mall of the Emirates Hotel", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Long-term",
    salary:"AED 2,500-3,500", currency:"AED/month", vacancies:5, application_method:"link",
    application_url:"https://careers.marriott.com/hotel-cleanliness-expert/job/P1-6719012-0", featured:true, urgent:false
  },
  {
    title:"Banquet Intern", slug:"northstar-marriott-banquet-intern-dubai", category:"hospitality", company:"marriott-international",
    description:"Hospitality internship opportunity at JW Marriott Marquis Hotel Dubai.",
    responsibilities:"Support banquet setup, guest service, event operations and hospitality standards under the hotel team.",
    requirements:"Professional communication, willingness to learn, teamwork and interest in hotel operations.",
    qualifications:"Hospitality students or early-career candidates are suitable for this internship.",
    location:"JW Marriott Marquis Hotel Dubai", country:"United Arab Emirates", city:"Dubai", employment_type:"Full-time", duration:"Internship",
    salary:"AED 2,000-3,000", currency:"AED/month", vacancies:3, application_method:"link",
    application_url:"https://careers.marriott.com/career-journeys/early-careers/jobs/page/1", featured:false, urgent:false
  },
  {
    title:"Security Officer", slug:"northstar-g4s-security-officer", category:"security", company:"g4s",
    description:"Professional security officer opportunity with G4S for protecting premises, people and assets.",
    responsibilities:"Conduct patrols, control access, monitor security systems, respond to incidents and maintain site security.",
    requirements:"Professional conduct, vigilance, communication skills, physical readiness and willingness to work shifts.",
    qualifications:"Security training or relevant experience preferred; local licensing requirements apply.",
    location:"Riyadh", country:"Saudi Arabia", city:"Riyadh", employment_type:"Full-time", duration:"Long-term",
    salary:"SAR 3,500-5,000", currency:"SAR/month", vacancies:8, application_method:"link",
    application_url:"https://careers.g4s.com/", featured:false, urgent:false
  },
  {
    title:"Project Coordinator", slug:"northstar-pcl-project-coordinator-fort-mcmurray", category:"construction", company:"pcl-construction",
    description:"Project Coordinator opportunity with PCL Construction supporting construction work in Fort McMurray.",
    responsibilities:"Support quantity takeoffs, contract administration, project schedules, site inspections, document control and material coordination.",
    requirements:"0-3 years of construction or related experience; strong planning, communication and Microsoft Office skills.",
    qualifications:"Construction trade certification or post-secondary diploma/degree in construction management or engineering preferred.",
    location:"Fort McMurray, Alberta", country:"Canada", city:"Fort McMurray", employment_type:"Full-time", duration:"Contract / project-based",
    salary:"CAD 69,800-104,600", currency:"CAD/year", vacancies:1, application_method:"link",
    application_url:"https://careers.pcl.com/job/Fort-McMurray-Project-Coordinator-AB/1431448700/", featured:false, urgent:false
  },
  {
    title:"Experienced Engineer", slug:"northstar-aramco-experienced-engineer", category:"engineering", company:"saudi-aramco",
    description:"Experienced engineering opportunity with Saudi Aramco in Saudi Arabia.",
    responsibilities:"Perform engineering analysis, development, design, coordination and control of assigned projects.",
    requirements:"At least three years of applicable experience and strong knowledge in the relevant engineering specialty.",
    qualifications:"Bachelor degree or higher; professional engineering requirements may apply to the discipline.",
    location:"Dhahran / Saudi Arabia", country:"Saudi Arabia", city:"Dhahran", employment_type:"Full-time", duration:"Long-term",
    salary:"SAR 18,000-30,000", currency:"SAR/month", vacancies:5, application_method:"link",
    application_url:"https://careers.aramco.com/saudi/job/Experienced-Engineer-%28more-than-three-years-of-work-experience%29/856956723/", featured:false, urgent:false
  },
  {
    title:"Care Assistant", slug:"northstar-barchester-care-assistant-manchester", category:"caregiving", company:"barchester-healthcare",
    description:"Care Assistant opportunity with Barchester Healthcare supporting residents in a care-home environment.",
    responsibilities:"Support daily living, food and drink, care plans, companionship and resident wellbeing.",
    requirements:"Compassion, communication skills and experience caring for older people; care experience requirements vary by vacancy.",
    qualifications:"Relevant care experience; training and development are provided for successful staff.",
    location:"Manchester", country:"United Kingdom", city:"Manchester", employment_type:"Full-time", duration:"Permanent",
    salary:"GBP 12.50-14.50", currency:"GBP/hour", vacancies:6, application_method:"link",
    application_url:"https://jobs.barchester.com/search?jobType%5B%5D=1&jobType_name%5B%5D=Care+and+Support&orderBy=1&page=1", featured:false, urgent:false
  },
  {
    title:"Bus Driver", slug:"northstar-stagecoach-bus-driver-manchester", category:"driving", company:"stagecoach",
    description:"Qualified Bus Driver opportunity at Stagecoach Manchester.",
    responsibilities:"Drive buses safely, provide excellent customer service and work flexible shifts including weekends.",
    requirements:"Age 18+; valid PCV licence; right to work in the UK; safe and courteous driving approach.",
    qualifications:"Valid PCV licence and customer-service mindset.",
    location:"Manchester", country:"United Kingdom", city:"Manchester", employment_type:"Full-time", duration:"Permanent",
    salary:"GBP 19.06/hour; GBP 21.31 Saturday & Sunday + overtime", currency:"GBP/hour", vacancies:8, application_method:"link",
    application_url:"https://www.stagecoachbus.com/careers/job/job_posting-3-50279", featured:true, urgent:false
  },
] as const;

export async function restoreOriginalOpportunitiesServer() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: current } = await supabaseAdmin
    .from("opportunities")
    .select("slug")
    .in("slug", OPPORTUNITIES.map((item) => item.slug));

  const existing = new Set((current ?? []).map((row) => row.slug));
  const missing = OPPORTUNITIES.filter((item) => !existing.has(item.slug));

  if (!missing.length) {
    return { restored: 0, total: OPPORTUNITIES.length };
  }

  const categoryRows = CATEGORIES.map(([name, slug, description, image, display_order]) => ({
    name, slug, description, image, display_order, active: true,
  }));

  const companyRows = COMPANIES.map(([name, slug, description, country, city, industry]) => ({
    name, slug, description, country, city, industry, verified: true,
  }));

  const { error: categoryError } = await supabaseAdmin
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" });
  if (categoryError) throw categoryError;

  const { error: companyError } = await supabaseAdmin
    .from("companies")
    .upsert(companyRows, { onConflict: "slug" });
  if (companyError) throw companyError;

  const { data: categories, error: categoryFetchError } = await supabaseAdmin
    .from("categories")
    .select("id,slug")
    .in("slug", [...new Set(missing.map((item) => item.category))]);
  if (categoryFetchError) throw categoryFetchError;

  const { data: companies, error: companyFetchError } = await supabaseAdmin
    .from("companies")
    .select("id,slug")
    .in("slug", [...new Set(missing.map((item) => item.company))]);
  if (companyFetchError) throw companyFetchError;

  const categoryIds = new Map((categories ?? []).map((row) => [row.slug, row.id]));
  const companyIds = new Map((companies ?? []).map((row) => [row.slug, row.id]));

  const rows = missing.map((item) => ({
    title: item.title,
    slug: item.slug,
    category_id: categoryIds.get(item.category) ?? null,
    company_id: companyIds.get(item.company) ?? null,
    description: item.description,
    responsibilities: item.responsibilities,
    requirements: "requirements" in item ? item.requirements : null,
    qualifications: "qualifications" in item ? item.qualifications : null,
    location: item.location,
    country: item.country,
    city: item.city,
    employment_type: item.employment_type,
    duration: item.duration,
    salary: item.salary,
    currency: item.currency,
    vacancies: item.vacancies,
    application_method: item.application_method,
    application_url: item.application_url,
    status: "published",
    featured: item.featured,
    urgent: item.urgent,
    verified: true,
    published_at: new Date().toISOString(),
  }));

  const { error: opportunityError } = await supabaseAdmin
    .from("opportunities")
    .insert(rows);
  if (opportunityError) throw opportunityError;

  return { restored: rows.length, total: OPPORTUNITIES.length };
}

export const restoreOriginalOpportunities = createServerFn({ method: "POST" }).handler(
  restoreOriginalOpportunitiesServer,
);
);
