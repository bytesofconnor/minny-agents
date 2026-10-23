import { CONTACT_EMAIL, SITE_URL } from "./site";

export const SITE_TITLE = "AI Agents in Minneapolis | Minny Agents";
export const SITE_DESCRIPTION =
  "AI agents for Twin Cities restaurants, shops, and service businesses. Missed calls, reviews, invoices, and follow-up — built in Minneapolis.";

export const faqs = [
  {
    q: "How does an engagement work?",
    a: "We start with a one-week working first version, then finish the system in production. Week 1 we spend with you, understand the problem, and build that first version. Weeks 2–6 we finish the system with tests and monitoring. Week 7+ is optional support or a clean handoff.",
  },
  {
    q: "What do you charge?",
    a: "We don't publish rates. Each engagement is scoped individually based on the work. Get in touch to discuss your situation.",
  },
  {
    q: "Do you work with small businesses?",
    a: "Yes. We work with restaurants, shops, and service businesses where an AI system can save real time or prevent real problems.",
  },
  {
    q: "Where are you based?",
    a: "Minneapolis, MN. We work with businesses across the Twin Cities and the rest of the United States.",
  },
  {
    q: "What if it doesn't work?",
    a: "If the first week isn't a fit, we stop there. Week 1 still delivers a working first version. No long contracts.",
  },
];

export const areaServed = [
  { "@type": "City", name: "Minneapolis" },
  { "@type": "City", name: "Saint Paul" },
  { "@type": "AdministrativeArea", name: "Minneapolis–Saint Paul" },
  { "@type": "Country", name: "United States" },
];

const address = {
  "@type": "PostalAddress",
  addressLocality: "Minneapolis",
  addressRegion: "MN",
  addressCountry: "US",
};

const geo = {
  "@type": "GeoCoordinates",
  latitude: "44.98",
  longitude: "-93.27",
};

export type Industry = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  lede: string;
  blocks: { h: string; p: string }[];
};

export const industries: Industry[] = [
  {
    slug: "restaurants",
    title: "AI for Restaurants in Minneapolis",
    heading: "AI agents for Minneapolis restaurants.",
    description:
      "AI agents for Twin Cities restaurants that answer missed calls, draft review replies, and get invoices into the books.",
    lede: "The phone rings during the dinner rush. Reviews pile up. Invoices wait in the inbox. We build AI that takes those jobs so you can run the floor.",
    blocks: [
      {
        h: "Missed calls & after-hours questions",
        p: "We build an AI that texts back every missed call, answers menu and hours questions, and hands anything else to your team.",
      },
      {
        h: "Reviews & reputation",
        p: "We build an AI that drafts a reply to every review for you to approve, and alerts you about food safety or staff complaints.",
      },
      {
        h: "Supplier invoices into the books",
        p: "We build an AI that reads each invoice, matches the vendor, enters it in QuickBooks, and flags anything unusual.",
      },
    ],
  },
  {
    slug: "home-services",
    title: "AI for Home Services in the Twin Cities",
    heading: "AI agents for Twin Cities home-service businesses.",
    description:
      "AI agents for Twin Cities trades and home-service shops — missed calls, quotes, invoices, and follow-up.",
    lede: "You are on a job when the phone rings. Quotes sit half-done. Invoices wait until Sunday. We build AI that handles the office work.",
    blocks: [
      {
        h: "Missed calls while you're on a job",
        p: "We build an AI that texts back missed calls, answers hours and service-area questions, and hands the rest to you.",
      },
      {
        h: "Quotes & large jobs",
        p: "We build an AI that collects what you need for a quote, drafts it for you to approve, and follows up when customers go quiet.",
      },
      {
        h: "Invoices into the books",
        p: "We build an AI that reads supplier invoices, matches the vendor, enters them in QuickBooks, and flags anything unusual.",
      },
    ],
  },
  {
    slug: "clinics",
    title: "AI for Clinics in the Twin Cities",
    heading: "AI agents for Twin Cities clinics.",
    description:
      "AI agents for Twin Cities clinics that handle after-hours questions, appointment follow-up, and inbox work. We do not make clinical decisions.",
    lede: "After-hours calls, appointment follow-up, and a full inbox. We build AI for those jobs. We do not make clinical decisions.",
    blocks: [
      {
        h: "After-hours questions",
        p: "We build an AI that answers hours, location, and routine questions after the desk closes, and hands anything clinical to your staff.",
      },
      {
        h: "Appointment follow-up",
        p: "We build an AI that sends reminders and follows up on unanswered booking messages for you to approve.",
      },
      {
        h: "Inbox work",
        p: "We build an AI that drafts replies to routine messages and flags anything that needs a person.",
      },
    ],
  },
];

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Minny Agents",
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Minny Agents",
        url: SITE_URL,
        logo: `${SITE_URL}/icon`,
        image: `${SITE_URL}/opengraph-image`,
        description: SITE_DESCRIPTION,
        foundingDate: "2026",
        founder: {
          "@type": "Person",
          name: "Connor Barrett",
        },
        address,
        email: CONTACT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Business Inquiries",
          email: CONTACT_EMAIL,
        },
        areaServed,
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${SITE_URL}/#service`,
        name: "Minny Agents",
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        address,
        geo,
        areaServed,
        knowsAbout: [
          "AI agents",
          "restaurant automation",
          "small-business automation",
          "Twin Cities",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "AI agent services",
          itemListElement: industries.map((industry) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: industry.title,
              url: `${SITE_URL}/${industry.slug}`,
              description: industry.description,
              areaServed,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faqpage`,
        url: `${SITE_URL}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };
}

export function industryJsonLd(industry: Industry) {
  const url = `${SITE_URL}/${industry.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: industry.title,
        description: industry.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#service` },
        inLanguage: "en-US",
      },
      {
        "@type": "Service",
        "@id": `${url}/#service`,
        name: industry.title,
        url,
        description: industry.description,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: industry.title, item: url },
        ],
      },
    ],
  };
}
