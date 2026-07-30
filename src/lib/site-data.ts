// ============================================================
// National Select Urgent Care — site content
// Ported verbatim from the Claude Design source data model.
// ============================================================

export const CLINIC = {
  name: "National Select Urgent Care",
  phone: "(301) 555-0142",
  phoneHref: "tel:+13015550142",
  fax: "(301) 555-0143",
  addressLine1: "1420 Birchwood Avenue, Suite 100",
  addressLine2: "Silver Spring, MD 20910",
  addressShort: "1420 Birchwood Ave, Silver Spring, MD",
  mapsHref: "https://maps.google.com/?q=Silver+Spring+MD",
} as const;

export type NavItem = { id: string; label: string; href: string };

// Ordered as in the source; primary nav + utility nav are derived below.
export const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "services", label: "Services", href: "/services" },
  { id: "about", label: "About", href: "/about" },
  { id: "providers", label: "Our team", href: "/providers" },
  { id: "insurance", label: "Insurance", href: "/insurance" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "blog", label: "Health news", href: "/blog" },
  { id: "contact", label: "Contact", href: "/contact" },
];

// Source: mainNav = indices [0,1,2,3,7]; utilityNav = indices [4,5,6]
export const MAIN_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[7]];
export const UTILITY_NAV = [NAV[4], NAV[5], NAV[6]];

export const HOURS = [
  { day: "Monday – Friday", time: "8:00 am – 8:00 pm" },
  { day: "Saturday – Sunday", time: "9:00 am – 5:00 pm" },
  { day: "Holidays", time: "9:00 am – 3:00 pm" },
] as const;

export type Service = {
  id: string;
  name: string;
  blurb: string;
  duration: string;
  price: string;
  intro: string;
  items: string[];
  expect: { n: string; title: string; body: string }[];
};

export const SERVICES: Service[] = [
  {
    id: "illnesses",
    name: "Illnesses",
    blurb:
      "Fevers, coughs, sore throats and the bugs going around — diagnosed and treated the same day.",
    duration: "30–45 minutes",
    price: "$149",
    intro:
      "Most of what walks through our door is an everyday illness that just needs a clinician's eyes on it. We'll examine you, run any rapid tests on site, and send prescriptions straight to your pharmacy before you leave.",
    items: [
      "Cold, flu and COVID-19",
      "Sore throat and strep",
      "Sinus and ear infections",
      "Bronchitis and cough",
      "Stomach bugs and dehydration",
      "Urinary tract infections",
      "Pink eye",
      "Rashes and allergic reactions",
    ],
    expect: [
      { n: "1", title: "Check in", body: "Online or at the front desk. We only need your ID, insurance card and a short symptom form." },
      { n: "2", title: "See a clinician", body: "A physician, NP or PA examines you and explains what they think is going on, in plain words." },
      { n: "3", title: "Testing on site", body: "Strep, flu, COVID, urine and basic bloodwork are run here, with most results back in 15 minutes." },
      { n: "4", title: "Leave with a plan", body: "Prescriptions sent electronically, a written summary, and a number to call if things get worse." },
    ],
  },
  {
    id: "injuries",
    name: "Injuries",
    blurb: "Sprains, cuts, burns and breaks — X-ray, stitches and splinting without an ER visit.",
    duration: "45–60 minutes",
    price: "$189",
    intro:
      "Twisted an ankle on the trail? Sliced a finger cooking? We handle the injuries that hurt too much to ignore but don't need an emergency room.",
    items: [
      "Sprains and strains",
      "Simple fractures and splinting",
      "Cuts needing stitches or glue",
      "Minor burns",
      "Back and neck strain",
      "Sports injuries",
      "Foreign object removal",
      "Wound care and dressing changes",
    ],
    expect: [
      { n: "1", title: "Fast triage", body: "Injuries get looked at quickly — tell the front desk what happened and we prioritise accordingly." },
      { n: "2", title: "Imaging if needed", body: "Digital X-ray is on site, so you find out whether it is broken during the same visit." },
      { n: "3", title: "Treatment", body: "Stitches, glue, splints, boots and slings — applied here, with the supplies to take home." },
      { n: "4", title: "Follow-up", body: "We arrange orthopaedic referral if you need one and can do your recheck here in a few days." },
    ],
  },
  {
    id: "physicals",
    name: "Physicals",
    blurb: "School, sports, camp, employment and DOT physicals, usually finished in under an hour.",
    duration: "30 minutes",
    price: "$79",
    intro:
      "Bring the form, walk out with it signed. Our physicals are thorough but efficient, and no appointment is required.",
    items: [
      "School and sports physicals",
      "Camp forms",
      "Pre-employment exams",
      "DOT / CDL certification",
      "Immigration physicals",
      "Annual wellness checks",
    ],
    expect: [
      { n: "1", title: "Bring your form", body: "Whatever the school, league or employer gave you — we'll complete it during the visit." },
      { n: "2", title: "Vitals and history", body: "Height, weight, blood pressure, vision, and a review of medications and past problems." },
      { n: "3", title: "Exam", body: "A head-to-toe check appropriate to the form, including heart and lungs for sports clearance." },
      { n: "4", title: "Signed and done", body: "You leave with the completed paperwork, plus a copy for your records." },
    ],
  },
  {
    id: "labs",
    name: "Lab testing",
    blurb: "Rapid tests read here in minutes, plus full bloodwork with results in your portal.",
    duration: "15–30 minutes",
    price: "$45",
    intro:
      "You don't need to be sick to use our lab. Walk in for a rapid test, a blood draw ordered by another doctor, or routine screening.",
    items: [
      "Rapid strep, flu and COVID-19",
      "Complete blood count",
      "Cholesterol and A1c",
      "Thyroid panel",
      "Pregnancy testing",
      "STI screening",
      "Urinalysis and culture",
      "Mono and RSV testing",
    ],
    expect: [
      { n: "1", title: "Tell us what you need", body: "Bring the order from your doctor, or ask us which test fits your symptoms." },
      { n: "2", title: "Sample collected", body: "Swabs and draws are done by our own staff — no separate trip to a lab centre." },
      { n: "3", title: "Results", body: "Rapid tests in about 15 minutes; send-out panels are usually back within 48 hours." },
      { n: "4", title: "We explain them", body: "A clinician calls or messages you through the portal with what the numbers mean." },
    ],
  },
  {
    id: "vaccines",
    name: "Vaccines & immunizations",
    blurb: "Flu shots, travel vaccines, tetanus and childhood catch-up schedules.",
    duration: "15 minutes",
    price: "$35",
    intro:
      "Protection without a wait. Most vaccines are in stock and can be given the moment you walk in.",
    items: [
      "Seasonal flu",
      "COVID-19 boosters",
      "Tetanus (Tdap)",
      "Hepatitis A and B",
      "MMR and varicella",
      "Travel vaccines",
      "Pneumonia and shingles",
      "Childhood catch-up doses",
    ],
    expect: [
      { n: "1", title: "Check what you need", body: "Bring your record if you have one — we can also pull it from the state registry." },
      { n: "2", title: "Quick review", body: "We check allergies, timing and whether anything should be spaced out." },
      { n: "3", title: "The shot", body: "Given by a nurse, with a short wait afterwards for anyone with an allergy history." },
      { n: "4", title: "Documentation", body: "Updated record printed for you and filed with the Maryland immunization registry." },
    ],
  },
  {
    id: "womens",
    name: "Women's health",
    blurb: "Confidential, unhurried care for UTIs, contraception, screening and pregnancy testing.",
    duration: "30 minutes",
    price: "$149",
    intro:
      "A private room, a clinician who listens, and no lecture. Same-day appointments for the things that cannot wait weeks.",
    items: [
      "Urinary tract infections",
      "Yeast and bacterial infections",
      "Contraception and refills",
      "Pregnancy testing",
      "STI testing and treatment",
      "Emergency contraception",
      "Menstrual concerns",
      "Referral for imaging",
    ],
    expect: [
      { n: "1", title: "Private check-in", body: "You can write your reason for the visit instead of saying it at the desk." },
      { n: "2", title: "Talk it through", body: "A clinician takes your history somewhere private, with a chaperone if you want one." },
      { n: "3", title: "Exam and testing", body: "Only what is needed, explained before it happens, and you can stop at any point." },
      { n: "4", title: "Treatment and follow-up", body: "Prescriptions the same day and a discreet call with any results." },
    ],
  },
  {
    id: "xray",
    name: "Diagnostic & X-ray",
    blurb: "Digital X-ray and EKG on site, read the same day by our clinicians.",
    duration: "20–40 minutes",
    price: "$120",
    intro:
      "Answers during your visit, not next week. Our digital X-ray and EKG are in the building and read by the clinician who's already seen you.",
    items: [
      "Digital X-ray (bones and chest)",
      "EKG",
      "Pulse oximetry",
      "Rapid blood glucose",
      "Vision screening",
      "Spirometry",
      "Injury imaging",
      "Radiologist over-read within 24 hours",
    ],
    expect: [
      { n: "1", title: "Ordered during your visit", body: "No separate appointment or imaging centre — we do it in the room next door." },
      { n: "2", title: "Images taken", body: "A few minutes with our technologist. Low-dose digital equipment, no film." },
      { n: "3", title: "Same-visit read", body: "Your clinician reviews the images with you before you leave." },
      { n: "4", title: "Formal report", body: "A board-certified radiologist over-reads within a day and we call if anything changes." },
    ],
  },
];

export type Provider = {
  id: string;
  initials: string;
  name: string;
  title: string;
  tint: string;
  ink: string;
  short: string;
  bio1: string;
  bio2: string;
  quote: string;
  focus: string[];
  education: string;
  languages: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: "okafor",
    initials: "AO",
    name: "Dr. Amara Okafor",
    title: "Medical Director, Family Medicine",
    tint: "#FCEEED",
    ink: "#E8342B",
    short:
      "Founded the clinic after twelve years in emergency medicine. Sees patients of every age, from six months up.",
    bio1:
      "Dr. Okafor spent twelve years in hospital emergency departments across Maryland and the District before opening National Select Urgent Care. She started the clinic with a simple goal: give her neighbors the same quality of care she gave in the ER, without the wait or the bill.",
    bio2:
      "She is board certified in family medicine and holds a certificate in emergency ultrasound. She sees patients six days a week and still takes the last walk-in of the evening herself more often than she should.",
    quote:
      "The best part of my day is telling someone it's not serious and watching their shoulders drop.",
    focus: ["Acute illness", "Pediatric urgent care", "Chronic disease", "Bedside ultrasound"],
    education: "MD, University of Maryland School of Medicine. Family medicine residency, MedStar Franklin Square.",
    languages: "English, Igbo",
  },
  {
    id: "reyes",
    initials: "DR",
    name: "Daniel Reyes, PA-C",
    title: "Physician Assistant",
    tint: "#DDE6F4",
    ink: "#1B2A4A",
    short: "Our go-to for anything that needs stitches, splinting or an X-ray. Former athletic trainer.",
    bio1:
      "Before medicine, Daniel spent six years as an athletic trainer for high school and college teams, which is where his eye for a bad ankle came from. He handles most of our injury visits and teaches the rest of the team suturing.",
    bio2:
      "He is certified in advanced wound closure and sports injury management, and he will always tell you honestly whether you need an orthopaedist or just two weeks of rest.",
    quote: "Half of injury care is reassurance. People want to know when they can get back to their life.",
    focus: ["Sprains and fractures", "Laceration repair", "Sports injuries", "Splinting"],
    education: "MS Physician Assistant Studies, Towson University. ATC, Penn State.",
    languages: "English, Spanish",
  },
  {
    id: "hartley",
    initials: "JH",
    name: "Joanna Hartley, FNP-BC",
    title: "Family Nurse Practitioner",
    tint: "#E4EBF4",
    ink: "#1B2A4A",
    short: "Primary care and women's health. Known for never rushing an appointment.",
    bio1:
      "Joanna has practised in community clinics for eighteen years and leads our primary care and women's health visits. She takes on the patients with long, complicated stories, and she has an unusual amount of patience for them.",
    bio2:
      "She runs our annual wellness program and helps patients without a regular doctor set up ongoing care — often the most valuable thing that happens during an urgent care visit.",
    quote: "Nobody should have to compress ten years of health history into five minutes.",
    focus: ["Women's health", "Primary care", "Preventive screening", "Contraception"],
    education: "MSN, Johns Hopkins University School of Nursing. BSN, University of Maryland.",
    languages: "English",
  },
  {
    id: "silva",
    initials: "MS",
    name: "Dr. Marcus Silva",
    title: "Physician, Internal Medicine",
    tint: "#DDE6F4",
    ink: "#1B2A4A",
    short: "Adult medicine, chronic conditions and the diagnostic puzzles nobody else has solved.",
    bio1:
      "Dr. Silva joined us from a large internal medicine group where he grew frustrated with fifteen-minute slots. He looks after our adult patients with diabetes, blood pressure and heart conditions, and reads most of our EKGs.",
    bio2:
      "He is the person the rest of the team consults when a case does not add up, and he genuinely enjoys explaining lab results line by line.",
    quote: "A good diagnosis usually starts with letting the patient finish their sentence.",
    focus: ["Diabetes and blood pressure", "EKG interpretation", "Adult primary care", "Complex diagnosis"],
    education: "MD, Georgetown University. Internal medicine residency, Sinai Hospital Baltimore.",
    languages: "English, Portuguese",
  },
  {
    id: "nguyen",
    initials: "LN",
    name: "Linh Nguyen, RN",
    title: "Lead Clinical Nurse",
    tint: "#FCEEED",
    ink: "#E8342B",
    short: "Runs our lab, immunization program and the calm at the centre of a busy Saturday.",
    bio1:
      "Linh manages our on-site lab and vaccine program, and she is usually the first clinical person you meet. She has an exceptional talent for a painless blood draw and for making frightened children laugh.",
    bio2:
      "She coordinates our immunization records with the Maryland registry and runs the flu clinic we hold every October in the parking lot.",
    quote: "Kids remember how a shot felt for years. It is worth taking the extra minute.",
    focus: ["Phlebotomy", "Immunizations", "Pediatric comfort", "Triage"],
    education: "BSN, Salisbury University. Certified in pediatric advanced life support.",
    languages: "English, Vietnamese",
  },
  {
    id: "bell",
    initials: "TB",
    name: "Tasha Bell",
    title: "Patient Services Manager",
    tint: "#E4EBF4",
    ink: "#1B2A4A",
    short: "The person who sorts out your insurance, your bill and your records request.",
    bio1:
      "Tasha has worked in medical billing and front-office care for fifteen years, and she is the reason our prices are posted publicly. If a bill looks wrong to you, she will get on the phone with your insurer herself.",
    bio2:
      "She also manages records requests, payment plans and our sliding-scale program for neighbors going through a hard stretch.",
    quote: "Nobody should get a bill they cannot understand. If you cannot read it, call me.",
    focus: ["Insurance verification", "Billing questions", "Payment plans", "Medical records"],
    education: "Certified Professional Biller (CPB), AAPC.",
    languages: "English",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Walked in on a Sunday with my son at 4pm, X-ray done and wrist splinted by 5. Everyone spoke to him directly instead of over his head. We were home for dinner.",
    initials: "RM",
    name: "Renée M.",
    meta: "Visited for an injury",
  },
  {
    quote:
      "I put off getting a sore throat looked at for a week because I was worried about the cost. They told me the price up front — $149 — and the strep test was included. That's it. No mystery bill.",
    initials: "DK",
    name: "Devin K.",
    meta: "Visited for an illness",
  },
  {
    quote:
      "Joanna spent thirty minutes with me and actually listened. I've had primary care doctors give me less. I've switched my whole family here.",
    initials: "AP",
    name: "Ana P.",
    meta: "Primary care patient",
  },
] as const;

export const INSURERS = [
  "Aetna",
  "CareFirst BlueCross BlueShield",
  "Cigna",
  "UnitedHealthcare",
  "Medicare",
  "Maryland Medicaid",
  "Johns Hopkins Health Plans",
  "Humana",
  "Tricare",
  "Kaiser (out-of-network)",
] as const;

export const PRICES = [
  { name: "Urgent care visit", note: "Exam, diagnosis and treatment plan", price: "$149" },
  { name: "Primary care visit", note: "Established or new patient, 30 minutes", price: "$129" },
  { name: "School, sports or camp physical", note: "Includes completing your form", price: "$79" },
  { name: "DOT / CDL physical", note: "Certified medical examiner", price: "$99" },
  { name: "Digital X-ray", note: "Per body area, includes radiologist over-read", price: "$120" },
  { name: "Rapid test", note: "Strep, flu, COVID-19 or pregnancy", price: "$35" },
  { name: "Stitches or wound repair", note: "Depends on size and location", price: "from $199" },
  { name: "Vaccine", note: "Flu, Tdap, hepatitis and more", price: "from $35" },
] as const;

export const REASONS = [
  {
    title: "Seen in under an hour, most days",
    body:
      "We staff for the busy hours instead of hoping you'll wait. Check in online and we'll text you when a room is ready.",
  },
  {
    title: "Urgent care and primary care together",
    body:
      "Come in for a sprain today, stay with us for your annual physical. One chart, one team, one place that knows your history.",
  },
  {
    title: "Prices posted before you agree to anything",
    body:
      "Self-pay rates are on our website and on the wall. You'll never open a bill months later and wonder what happened.",
  },
  {
    title: "X-ray, labs and stitches on site",
    body:
      "Nearly everything happens in this building, so you get answers during your visit rather than in a follow-up.",
  },
  {
    title: "Independent, not part of a hospital",
    body:
      "Our clinicians make decisions about your care. No corporate quotas, no pressure to send you somewhere more expensive.",
  },
] as const;

export const VALUES = [
  {
    title: "We explain everything",
    body:
      "No jargon, no rushing. If you leave without understanding what's wrong and what to do next, we haven't finished.",
  },
  {
    title: "We respect your time",
    body:
      "Your hour matters as much as ours. We publish real wait times and we tell you honestly if today is a long one.",
  },
  {
    title: "We are honest about cost",
    body:
      "Prices up front, itemised receipts, and a sliding scale for neighbors who need it. We'd rather you come in than avoid care.",
  },
  {
    title: "We know when to send you elsewhere",
    body:
      "If you need an ER, a specialist or a second opinion, we'll say so immediately and help you get there.",
  },
] as const;

export const STATS = [
  { value: "7 days", label: "Open every week, including evenings and weekends" },
  { value: "42 min", label: "Average time from walking in to walking out" },
  { value: "11", label: "Clinicians and staff, all permanent team members" },
  { value: "18k+", label: "Neighbors cared for since we opened" },
] as const;

export const RESOURCE_CARDS = [
  {
    title: "Patient portal",
    body: "View your visit summaries, lab results and prescriptions, and message the clinic between visits.",
    cta: "Sign in to the portal",
  },
  {
    title: "Request your records",
    body: "Ask for a copy of your chart, or have us send it to another doctor. Most requests are done in two business days.",
    cta: "Request records",
  },
  {
    title: "New patient forms",
    body: "Fill these in before you arrive and skip the clipboard. Takes about five minutes on a phone.",
    cta: "Start my forms",
  },
  {
    title: "Billing and payments",
    body: "Pay a balance, set up a payment plan, or ask for an itemised receipt for your HSA or FSA.",
    cta: "Go to billing",
  },
] as const;

export const FORMS = [
  { name: "New patient registration", note: "Bring this completed on your first visit", size: "PDF · 2 pages" },
  { name: "Medical records release", note: "Authorises us to send your chart elsewhere", size: "PDF · 1 page" },
  { name: "Sports physical form", note: "Maryland state standard form", size: "PDF · 2 pages" },
  { name: "Notice of privacy practices", note: "How we handle your health information", size: "PDF · 4 pages" },
  { name: "Financial hardship application", note: "For our sliding-scale program", size: "PDF · 1 page" },
] as const;

export const FAQS = [
  { q: "Do I need an appointment?", a: "No. Walk in any time we're open and we'll see you. Checking in online simply holds your place so you can wait at home instead of in our lobby." },
  { q: "How long will I wait?", a: "Most patients are seen within 30 minutes, and the whole visit averages about 42 minutes. Weekday mornings and late evenings are usually quietest." },
  { q: "What should I bring?", a: "A photo ID, your insurance card, a list of any medications you take, and the form you need signed if you are here for a physical." },
  { q: "Do you see children?", a: "Yes, from six months old and up. For babies under six months we recommend your pediatrician or the emergency room, and we will help you decide." },
  { q: "Can you be my regular doctor?", a: "Yes. We offer primary care alongside urgent care, so you can stay with us for annual physicals, chronic conditions and prescription management." },
  { q: "What if I don't have insurance?", a: "Our self-pay prices are flat and published. An urgent care visit is $149 including the exam, and tests are priced separately so nothing is hidden." },
  { q: "How do I get my test results?", a: "Rapid results come back during your visit. Send-out labs post to your patient portal, usually within 48 hours, and a clinician calls you about anything abnormal." },
  { q: "Can you refill a prescription?", a: "We can refill most routine medications during a visit. We do not prescribe controlled substances for ongoing conditions." },
] as const;

export type PostBlock = { t: "p" | "h"; text: string };
export type Post = {
  id: string;
  category: string;
  tint: string;
  ink: string;
  date: string;
  read: string;
  author: string;
  title: string;
  excerpt: string;
  lede: string;
  comeIn: string;
  body: PostBlock[];
};

export const POSTS: Post[] = [
  {
    id: "strep",
    category: "Illness",
    tint: "#FCEEED",
    ink: "#E8342B",
    date: "July 14, 2026",
    read: "4 min read",
    author: "Dr. Amara Okafor",
    title: "Sore throat: when it is strep and when it is not",
    excerpt:
      "Most sore throats are viral and get better on their own. Here is how to tell the difference, and when a test is worth it.",
    lede: "Every week we see people who have suffered through a week of throat pain because they were not sure it was worth coming in. Here is the honest version.",
    comeIn:
      "Your sore throat comes with a fever over 101°F, white patches on your tonsils, swollen neck glands, or you are struggling to swallow liquids.",
    body: [
      { t: "p", text: "A sore throat is one of the most common reasons people walk into our clinic, and roughly seven out of ten of them turn out to be viral. Viral sore throats come with a runny nose, a cough, or a hoarse voice, and they clear up in three to five days without antibiotics." },
      { t: "h", text: "What strep actually looks like" },
      { t: "p", text: "Strep throat tends to arrive suddenly and without a cough. The pain is sharp when you swallow, the glands under your jaw swell and hurt to touch, and you often have a fever. Children sometimes get a stomach ache or a rash instead of the classic symptoms." },
      { t: "p", text: "The only way to be certain is a swab. Our rapid strep test takes about fifteen minutes, and if it is negative but we are still suspicious, we send a culture that confirms within two days." },
      { t: "h", text: "Why it matters" },
      { t: "p", text: "Untreated strep can occasionally lead to complications like rheumatic fever, which is rare but serious. Antibiotics also shorten how long you are contagious, which matters if you have small children or work in a school." },
      { t: "h", text: "What helps in the meantime" },
      { t: "p", text: "Warm salt water gargles, cold drinks, throat lozenges and ibuprofen genuinely help. Skip the leftover antibiotics in your cabinet — they will not touch a virus and they make future infections harder to treat." },
    ],
  },
  {
    id: "sprain",
    category: "Injury",
    tint: "#DDE6F4",
    ink: "#1B2A4A",
    date: "July 2, 2026",
    read: "5 min read",
    author: "Daniel Reyes, PA-C",
    title: "Is it a sprain or a break? What we look for",
    excerpt:
      "You usually cannot tell from the outside — but there are a few signs that make us reach for the X-ray straight away.",
    lede: "People often wait days with an ankle injury because they can still limp on it. Walking on it does not rule out a fracture.",
    comeIn:
      "You cannot put weight on the limb, there is an obvious deformity, the pain is directly over a bone rather than soft tissue, or the swelling has not improved after two days.",
    body: [
      { t: "p", text: "A sprain is a stretched or torn ligament; a fracture is a crack in the bone. Both swell, both bruise, and both hurt a great deal. The difference matters because a missed fracture heals badly." },
      { t: "h", text: "The signs that concern us" },
      { t: "p", text: "We pay attention to where the tenderness sits. Pain directly over a bony point, an inability to take four steps, or a joint that looks wrong in shape all push us towards imaging immediately." },
      { t: "h", text: "What we do about it" },
      { t: "p", text: "Our digital X-ray is on site, so you find out during the same visit. If it is broken, we splint it here and arrange the orthopaedic follow-up. If it is a sprain, you leave with a brace and a rehabilitation plan." },
      { t: "h", text: "First 48 hours at home" },
      { t: "p", text: "Rest it, ice for twenty minutes at a time, wrap it with light compression, and keep it raised above your heart when you can. Move it gently once the sharp pain settles — total immobility slows recovery." },
    ],
  },
  {
    id: "fever",
    category: "Kids",
    tint: "#E4EBF4",
    ink: "#1B2A4A",
    date: "June 21, 2026",
    read: "4 min read",
    author: "Dr. Amara Okafor",
    title: "A parent's guide to fevers that are actually worrying",
    excerpt:
      "The number on the thermometer matters less than how your child is behaving. Here is what we watch for.",
    lede: "Fever is not an illness. It is the body doing its job. What we care about is how your child looks and acts, not the exact reading.",
    comeIn:
      "Your child is under three months old with any fever, is difficult to wake, has a stiff neck or a rash that does not fade under pressure, or has been feverish for more than three days.",
    body: [
      { t: "p", text: "Parents often arrive apologising for coming in over a fever. Please never apologise for that. But it may help to know what we are actually assessing." },
      { t: "h", text: "Behaviour beats the thermometer" },
      { t: "p", text: "A child with a temperature of 103°F who is drinking, playing between naps and responding normally is usually less concerning than a child at 100.8°F who is limp and will not take fluids." },
      { t: "h", text: "Age changes everything" },
      { t: "p", text: "Under three months, any fever needs same-day assessment, and often in an emergency department rather than here. Between three months and three years we look carefully for the source. Older children we can usually manage at home." },
      { t: "h", text: "Managing it at home" },
      { t: "p", text: "Fluids first, always. Paracetamol or ibuprofen for comfort rather than to chase a number. Lukewarm baths if it helps them settle, and no cold baths or rubbing alcohol." },
    ],
  },
  {
    id: "er",
    category: "Guidance",
    tint: "#DDE6F4",
    ink: "#1B2A4A",
    date: "June 9, 2026",
    read: "3 min read",
    author: "Dr. Marcus Silva",
    title: "Urgent care or the emergency room? A short guide",
    excerpt:
      "Choosing right can save you hours and thousands of dollars. Choosing wrong can be dangerous. Here is the line we draw.",
    lede: "We would much rather you called and asked than guessed. But most of the time, the answer follows a fairly simple rule.",
    comeIn:
      "Your problem is uncomfortable, painful or worrying but not life-threatening — that is exactly what urgent care exists for.",
    body: [
      { t: "h", text: "Go to the emergency room for" },
      { t: "p", text: "Chest pain or pressure, trouble breathing, sudden weakness or difficulty speaking, heavy bleeding that will not stop, a serious head injury, severe abdominal pain, or thoughts of harming yourself. Call 911 rather than driving." },
      { t: "h", text: "Come to us for" },
      { t: "p", text: "Fevers, coughs, sore throats, ear pain, sprains, cuts needing stitches, minor burns, rashes, urinary symptoms, mild asthma flares, and anything you would normally see a family doctor for but cannot wait weeks to book." },
      { t: "h", text: "The cost difference is not small" },
      { t: "p", text: "A typical emergency room visit for a non-emergency runs into the thousands. Our self-pay urgent care visit is $149, and most insured patients pay a standard copay." },
      { t: "p", text: "When in doubt, call us at (301) 555-0142. If we think you need an emergency room, we will tell you within a minute and help you get there." },
    ],
  },
  {
    id: "summer",
    category: "Seasonal",
    tint: "#FCEEED",
    ink: "#E8342B",
    date: "May 28, 2026",
    read: "4 min read",
    author: "Linh Nguyen, RN",
    title: "Heat, ticks and pool ears: a Maryland summer checklist",
    excerpt: "The three things we treat most between June and September, and how to avoid all of them.",
    lede: "Every summer brings the same trio through our doors. A little preparation prevents most of it.",
    comeIn:
      "A tick bite develops a spreading rash, you feel dizzy and stop sweating in the heat, or ear pain keeps you awake.",
    body: [
      { t: "h", text: "Heat illness" },
      { t: "p", text: "Maryland humidity makes it harder for your body to cool itself. Headache, nausea and heavy sweating mean stop and get into shade with fluids. Confusion or hot dry skin is an emergency — call 911." },
      { t: "h", text: "Ticks" },
      { t: "p", text: "Check yourself and your children after any time in tall grass or woods. Remove a tick with fine tweezers close to the skin and pull straight up. Watch the spot for thirty days and come in if a spreading rash appears." },
      { t: "h", text: "Swimmer's ear" },
      { t: "p", text: "Water trapped in the ear canal breeds infection. Tilt and dry your ears after swimming, skip the cotton buds, and see us if the outer ear hurts when you tug it." },
    ],
  },
  {
    id: "physicalprep",
    category: "Physicals",
    tint: "#E4EBF4",
    ink: "#1B2A4A",
    date: "May 12, 2026",
    read: "3 min read",
    author: "Joanna Hartley, FNP-BC",
    title: "How to get your sports physical done in one visit",
    excerpt: "Bring these four things and you will walk out with a signed form in about half an hour.",
    lede: "August is our busiest month for school and sports forms. A little preparation gets you in and out.",
    comeIn: "Your season starts soon and the form is still blank — walk in any day, no appointment needed.",
    body: [
      { t: "h", text: "What to bring" },
      { t: "p", text: "The form itself from the school or league, your insurance card and ID, a list of medications, and your immunization record if you have one. Parents need to sign the consent section for anyone under eighteen." },
      { t: "h", text: "What we check" },
      { t: "p", text: "Height, weight, blood pressure, vision, heart and lungs, joints and flexibility, and a short conversation about any past injuries, fainting, chest pain or family heart history." },
      { t: "h", text: "If something comes up" },
      { t: "p", text: "Occasionally we find something worth investigating before clearance — usually a heart murmur or a blood pressure reading. We will explain what it means and arrange the next step quickly so it does not cost your child a season." },
    ],
  },
];

// --- lookups -------------------------------------------------
export const getService = (id: string) => SERVICES.find((s) => s.id === id);
export const getProvider = (id: string) => PROVIDERS.find((p) => p.id === id);
export const getPost = (id: string) => POSTS.find((p) => p.id === id);

// ============================================================
// Live open/closed status — ported from status() in the source.
// ============================================================
export type ClinicStatus = {
  isOpen: boolean;
  line: string;
  closesAt: string;
  cardLabel: string;
  cardTime: string;
  today: string;
};

function fmt(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return hh + (mm ? ":" + String(mm).padStart(2, "0") : "") + ap;
}

export function getStatus(now: Date = new Date()): ClinicStatus {
  const d = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const weekend = d === 0 || d === 6;
  const open = weekend ? 9 * 60 : 8 * 60;
  const close = weekend ? 17 * 60 : 20 * 60;
  const isOpen = mins >= open && mins < close;
  const beforeOpen = mins < open;
  const nextDay = (d + 1) % 7;
  const nextOpen = beforeOpen ? open : nextDay === 0 || nextDay === 6 ? 9 * 60 : 8 * 60;
  const when = beforeOpen ? "today" : "tomorrow";
  return {
    isOpen,
    line: isOpen ? "Open now until " + fmt(close) : "Closed now · Opens " + fmt(nextOpen) + " " + when,
    closesAt: fmt(close),
    cardLabel: isOpen ? "Open now until" : "Opens " + when + " at",
    cardTime: isOpen ? fmt(close) : fmt(nextOpen),
    today: fmt(open) + " – " + fmt(close),
  };
}

// Which hours row is "active" for today (bold), ported from hourRow().
export function activeHourIndex(now: Date = new Date()): number {
  const today = now.getDay();
  if (today >= 1 && today <= 5) return 0;
  if (today === 0 || today === 6) return 1;
  return -1;
}
