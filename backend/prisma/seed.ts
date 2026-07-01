import { PrismaClient, Sector, ListingStatus, VerificationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const isNeon = process.env.DB_URL?.includes('neon.tech');
const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
  ...(isNeon && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

const categories = [
  {
    name: 'Education',
    slug: 'education',
    description: 'Schools, tutoring centers, training institutes, and educational services',
    icon: 'FiBookOpen',
    status: 'ACTIVE',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Hospitals, clinics, pharmacies, and health & wellness services',
    icon: 'FiHeart',
    status: 'ACTIVE',
  },
  {
    name: 'Hospitality',
    slug: 'hospitality',
    description: 'Hotels, restaurants, event venues, and travel services',
    icon: 'FiHome',
    status: 'ACTIVE',
  },
  {
    name: 'Logistics',
    slug: 'logistics',
    description: 'Transport, delivery services, warehousing, and supply chain',
    icon: 'FiTruck',
    status: 'ACTIVE',
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'Consulting, legal, financial, and business services',
    icon: 'FiBriefcase',
    status: 'ACTIVE',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'IT services, software development, repairs, and tech support',
    icon: 'FiMonitor',
    status: 'ACTIVE',
  },
  {
    name: 'Retail',
    slug: 'retail',
    description: 'Shops, markets, e-commerce, and consumer goods',
    icon: 'FiShoppingBag',
    status: 'ACTIVE',
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Properties, agents, developers, and property management',
    icon: 'FiMapPin',
    status: 'ACTIVE',
  },
];

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN';
  isVerified: boolean;
}

interface SeedListing {
  title: string;
  slug: string;
  description: string;
  categoryName: string;
  ownerEmail: string;
  sector: Sector;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    whatsapp: string;
  };
  pricing: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  features: string[];
  images: string[];
  averageRating: number;
  reviewCount: number;
}

const users: SeedUser[] = [
  {
    firstName: 'Admin', lastName: 'User', email: 'admin@seed.dev',
    password: 'admin123', role: 'ADMIN', isVerified: true,
  },
  {
    firstName: 'Sarah', lastName: 'Okafor', email: 'academy@seed.dev',
    password: 'provider123', role: 'PROVIDER', isVerified: true,
  },
  {
    firstName: 'David', lastName: 'Adebayo', email: 'medical@seed.dev',
    password: 'provider123', role: 'PROVIDER', isVerified: true,
  },
  {
    firstName: 'Chioma', lastName: 'Eze', email: 'hotel@seed.dev',
    password: 'provider123', role: 'PROVIDER', isVerified: true,
  },
  {
    firstName: 'Emeka', lastName: 'Nwosu', email: 'logistics@seed.dev',
    password: 'provider123', role: 'PROVIDER', isVerified: true,
  },
  {
    firstName: 'Tunde', lastName: 'Balogun', email: 'apex@seed.dev',
    password: 'provider123', role: 'PROVIDER', isVerified: true,
  },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const listings: SeedListing[] = [
  // ── Education ──
  {
    title: 'Sunshine Academy', slug: 'sunshine-academy',
    description: 'Premier early childhood education center offering Montessori-based learning for children ages 2–12. Our experienced educators foster creativity, critical thinking, and character development in a safe, nurturing environment.',
    categoryName: 'Education', ownerEmail: 'academy@seed.dev', sector: 'Education' as Sector,
    location: { address: '15 Adeola Odeku Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4489, longitude: 3.3907 },
    contact: { phone: '+234-802-111-2233', email: 'info@sunshineacademy.edu.ng', website: 'https://sunshineacademy.edu.ng', whatsapp: '+234-802-111-2233' },
    pricing: { minimum: 150000, maximum: 600000, currency: 'NGN' },
    operatingHours: { monday: { open: '07:30', close: '17:00' }, tuesday: { open: '07:30', close: '17:00' }, wednesday: { open: '07:30', close: '17:00' }, thursday: { open: '07:30', close: '17:00' }, friday: { open: '07:30', close: '16:00' }, saturday: { open: '08:00', close: '13:00' } },
    features: ['Montessori Curriculum', 'Qualified Teachers', 'After-School Program', 'Transport Services', 'Meal Plans'],
    images: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'],
    averageRating: 4.7, reviewCount: 84,
  },
  {
    title: 'Bright Future Preparatory School', slug: 'bright-future-prep',
    description: 'College preparatory secondary school with a track record of 98% university admission rate. Offering STEM, arts, and sports programs with state-of-the-art facilities.',
    categoryName: 'Education', ownerEmail: 'academy@seed.dev', sector: 'Education' as Sector,
    location: { address: '42 Victoria Island Crescent', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4281, longitude: 3.4219 },
    contact: { phone: '+234-809-222-3344', email: 'admissions@brightfuture.edu.ng', website: 'https://brightfuture.edu.ng', whatsapp: '+234-809-222-3344' },
    pricing: { minimum: 350000, maximum: 1200000, currency: 'NGN' },
    operatingHours: { monday: { open: '07:00', close: '16:00' }, tuesday: { open: '07:00', close: '16:00' }, wednesday: { open: '07:00', close: '16:00' }, thursday: { open: '07:00', close: '16:00' }, friday: { open: '07:00', close: '15:00' }, saturday: { open: '08:00', close: '14:00' } },
    features: ['STEM Lab', 'Sports Complex', 'Boarding Facilities', 'College Counseling', 'Arts Program'],
    images: ['https://images.unsplash.com/photo-1562774053-701939374585?w=800'],
    averageRating: 4.5, reviewCount: 126,
  },
  {
    title: 'SkillForge Tech Institute', slug: 'skillforge-tech-institute',
    description: 'Intensive coding bootcamp and technology training center offering full-stack web development, data science, and mobile app development programs. Job placement rate of 85% within 6 months.',
    categoryName: 'Education', ownerEmail: 'academy@seed.dev', sector: 'Education' as Sector,
    location: { address: '88 Allen Avenue', city: 'Ikeja', state: 'Lagos', country: 'Nigeria', latitude: 6.6018, longitude: 3.3515 },
    contact: { phone: '+234-813-333-4455', email: 'hello@skillforge.ng', website: 'https://skillforge.ng', whatsapp: '+234-813-333-4455' },
    pricing: { minimum: 250000, maximum: 800000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '20:00' }, tuesday: { open: '08:00', close: '20:00' }, wednesday: { open: '08:00', close: '20:00' }, thursday: { open: '08:00', close: '20:00' }, friday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '17:00' }, sunday: { open: '10:00', close: '15:00' } },
    features: ['Hands-On Projects', 'Industry Mentors', 'Job Placement Support', 'Flexible Schedule', 'Certification'],
    images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'],
    averageRating: 4.8, reviewCount: 203,
  },
  // ── Healthcare ──
  {
    title: 'City Medical Center', slug: 'city-medical-center',
    description: 'Full-service private hospital with 24/7 emergency care, outpatient services, surgical suites, and diagnostic imaging. Accredited by the Nigerian health regulatory body.',
    categoryName: 'Healthcare', ownerEmail: 'medical@seed.dev', sector: 'Healthcare' as Sector,
    location: { address: '23 Isaac John Street', city: 'Ikeja', state: 'Lagos', country: 'Nigeria', latitude: 6.6059, longitude: 3.3581 },
    contact: { phone: '+234-805-444-5566', email: 'care@citymedicalcenter.com.ng', website: 'https://citymedicalcenter.com.ng', whatsapp: '+234-805-444-5566' },
    pricing: { minimum: 5000, maximum: 500000, currency: 'NGN' },
    operatingHours: { monday: { open: '00:00', close: '23:59' }, tuesday: { open: '00:00', close: '23:59' }, wednesday: { open: '00:00', close: '23:59' }, thursday: { open: '00:00', close: '23:59' }, friday: { open: '00:00', close: '23:59' }, saturday: { open: '00:00', close: '23:59' }, sunday: { open: '00:00', close: '23:59' } },
    features: ['24/7 Emergency', 'Diagnostic Imaging', 'Pharmacy', 'Ambulance Service', 'Specialist Consultations'],
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'],
    averageRating: 4.3, reviewCount: 312,
  },
  {
    title: 'Wellness First Clinic', slug: 'wellness-first-clinic',
    description: 'Modern family medicine clinic specializing in preventive care, pediatric health, immunizations, and chronic disease management. Walk-ins welcome.',
    categoryName: 'Healthcare', ownerEmail: 'medical@seed.dev', sector: 'Healthcare' as Sector,
    location: { address: '7 Awolowo Road', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4478, longitude: 3.3923 },
    contact: { phone: '+234-806-555-6677', email: 'hello@wellnessfirstclinic.com', website: 'https://wellnessfirstclinic.com', whatsapp: '+234-806-555-6677' },
    pricing: { minimum: 3000, maximum: 80000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' }, wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' }, friday: { open: '08:00', close: '17:00' }, saturday: { open: '09:00', close: '15:00' } },
    features: ['Family Medicine', 'Pediatrics', 'Immunizations', 'Lab Testing', 'Telemedicine'],
    images: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800'],
    averageRating: 4.6, reviewCount: 178,
  },
  {
    title: 'PharmaCare Plus', slug: 'pharmacare-plus',
    description: 'Community pharmacy offering prescription medications, over-the-counter drugs, health supplements, and free blood pressure checks. Fast delivery within Lagos.',
    categoryName: 'Healthcare', ownerEmail: 'medical@seed.dev', sector: 'Healthcare' as Sector,
    location: { address: '54 Opebi Road', city: 'Ikeja', state: 'Lagos', country: 'Nigeria', latitude: 6.6037, longitude: 3.3498 },
    contact: { phone: '+234-808-666-7788', email: 'info@pharmacareplus.ng', website: 'https://pharmacareplus.ng', whatsapp: '+234-808-666-7788' },
    pricing: { minimum: 500, maximum: 150000, currency: 'NGN' },
    operatingHours: { monday: { open: '07:00', close: '21:00' }, tuesday: { open: '07:00', close: '21:00' }, wednesday: { open: '07:00', close: '21:00' }, thursday: { open: '07:00', close: '21:00' }, friday: { open: '07:00', close: '21:00' }, saturday: { open: '08:00', close: '20:00' }, sunday: { open: '10:00', close: '16:00' } },
    features: ['Prescription Fulfillment', 'Free Delivery', 'Health Screening', 'Insurance Accepted', 'Loyalty Program'],
    images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800'],
    averageRating: 4.4, reviewCount: 95,
  },
  // ── Hospitality ──
  {
    title: 'Grand Horizon Hotel', slug: 'grand-horizon-hotel',
    description: 'Five-star luxury hotel overlooking the Atlantic coastline. Features 120 elegantly appointed rooms, infinity pool, world-class spa, and signature restaurant.',
    categoryName: 'Hospitality', ownerEmail: 'hotel@seed.dev', sector: 'Hospitality' as Sector,
    location: { address: '1 Ahmadu Bello Way', city: 'Victoria Island', state: 'Lagos', country: 'Nigeria', latitude: 6.4245, longitude: 3.4088 },
    contact: { phone: '+234-809-777-8899', email: 'reservations@grandhorizonhotel.com', website: 'https://grandhorizonhotel.com', whatsapp: '+234-809-777-8899' },
    pricing: { minimum: 85000, maximum: 450000, currency: 'NGN' },
    operatingHours: { monday: { open: '00:00', close: '23:59' }, tuesday: { open: '00:00', close: '23:59' }, wednesday: { open: '00:00', close: '23:59' }, thursday: { open: '00:00', close: '23:59' }, friday: { open: '00:00', close: '23:59' }, saturday: { open: '00:00', close: '23:59' }, sunday: { open: '00:00', close: '23:59' } },
    features: ['Swimming Pool', 'Spa & Wellness', 'Conference Rooms', 'Restaurant', 'Fitness Center'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    averageRating: 4.8, reviewCount: 445,
  },
  {
    title: 'The Golden Spoon Restaurant', slug: 'golden-spoon-restaurant',
    description: 'Award-winning fine dining restaurant serving contemporary African and international cuisine. Chef-led tasting menus, curated wine list, and private dining rooms.',
    categoryName: 'Hospitality', ownerEmail: 'hotel@seed.dev', sector: 'Hospitality' as Sector,
    location: { address: '29 Bishop Aboyade Cole Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4513, longitude: 3.4232 },
    contact: { phone: '+234-802-888-9900', email: 'reservations@goldenspoon.ng', website: 'https://goldenspoon.ng', whatsapp: '+234-802-888-9900' },
    pricing: { minimum: 15000, maximum: 75000, currency: 'NGN' },
    operatingHours: { monday: { open: '11:00', close: '22:00' }, tuesday: { open: '11:00', close: '22:00' }, wednesday: { open: '11:00', close: '22:00' }, thursday: { open: '11:00', close: '22:00' }, friday: { open: '11:00', close: '23:00' }, saturday: { open: '10:00', close: '23:00' }, sunday: { open: '10:00', close: '21:00' } },
    features: ['Fine Dining', 'Private Events', 'Wine Bar', 'Outdoor Terrace', 'Takeaway Available'],
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    averageRating: 4.6, reviewCount: 267,
  },
  {
    title: 'Skyline Events Venue', slug: 'skyline-events-venue',
    description: 'Premium event space for weddings, corporate gatherings, and social celebrations. Capacity for up to 500 guests with full catering, decor, and event planning services.',
    categoryName: 'Hospitality', ownerEmail: 'hotel@seed.dev', sector: 'Hospitality' as Sector,
    location: { address: '12 Ozumba Mbadiwe Avenue', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4376, longitude: 3.4145 },
    contact: { phone: '+234-805-999-0011', email: 'info@skylineevents.ng', website: 'https://skylineevents.ng', whatsapp: '+234-805-999-0011' },
    pricing: { minimum: 200000, maximum: 2000000, currency: 'NGN' },
    operatingHours: { monday: { open: '09:00', close: '18:00' }, tuesday: { open: '09:00', close: '18:00' }, wednesday: { open: '09:00', close: '18:00' }, thursday: { open: '09:00', close: '18:00' }, friday: { open: '09:00', close: '18:00' }, saturday: { open: '08:00', close: '22:00' }, sunday: { open: '08:00', close: '22:00' } },
    features: ['500 Guest Capacity', 'Catering Services', 'Event Planning', 'Sound System', 'Parking'],
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'],
    averageRating: 4.4, reviewCount: 134,
  },
  // ── Logistics ──
  {
    title: 'SwiftLogix Logistics', slug: 'swiftlogix-logistics',
    description: 'Nationwide freight and cargo shipping company specializing in road and sea transport. Handling everything from small parcels to full container loads with real-time tracking.',
    categoryName: 'Logistics', ownerEmail: 'logistics@seed.dev', sector: 'Logistics' as Sector,
    location: { address: '45 Apapa Wharf Road', city: 'Apapa', state: 'Lagos', country: 'Nigeria', latitude: 6.4518, longitude: 3.3589 },
    contact: { phone: '+234-803-111-2233', email: 'dispatch@swiftlogix.ng', website: 'https://swiftlogix.ng', whatsapp: '+234-803-111-2233' },
    pricing: { minimum: 5000, maximum: 500000, currency: 'NGN' },
    operatingHours: { monday: { open: '06:00', close: '20:00' }, tuesday: { open: '06:00', close: '20:00' }, wednesday: { open: '06:00', close: '20:00' }, thursday: { open: '06:00', close: '20:00' }, friday: { open: '06:00', close: '18:00' }, saturday: { open: '07:00', close: '16:00' } },
    features: ['Nationwide Coverage', 'Real-Time Tracking', 'Container Shipping', 'Warehousing', 'Insurance Covered'],
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'],
    averageRating: 4.2, reviewCount: 198,
  },
  {
    title: 'QuickShip Delivery', slug: 'quickship-delivery',
    description: 'Same-day and express courier service within major Nigerian cities. Real-time tracking, SMS notifications, and competitive rates for individuals and businesses.',
    categoryName: 'Logistics', ownerEmail: 'logistics@seed.dev', sector: 'Logistics' as Sector,
    location: { address: '22 Bode Thomas Street', city: 'Surulere', state: 'Lagos', country: 'Nigeria', latitude: 6.5002, longitude: 3.3546 },
    contact: { phone: '+234-806-222-3344', email: 'support@quickship.ng', website: 'https://quickship.ng', whatsapp: '+234-806-222-3344' },
    pricing: { minimum: 1500, maximum: 25000, currency: 'NGN' },
    operatingHours: { monday: { open: '07:00', close: '19:00' }, tuesday: { open: '07:00', close: '19:00' }, wednesday: { open: '07:00', close: '19:00' }, thursday: { open: '07:00', close: '19:00' }, friday: { open: '07:00', close: '19:00' }, saturday: { open: '08:00', close: '17:00' }, sunday: { open: '10:00', close: '14:00' } },
    features: ['Same-Day Delivery', 'Real-Time Tracking', 'SMS Alerts', 'Cash on Delivery', 'Bulk Discounts'],
    images: ['https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=800'],
    averageRating: 4.5, reviewCount: 523,
  },
  {
    title: 'SecureStore Warehousing', slug: 'securestore-warehousing',
    description: 'Modern warehousing and storage solutions with climate-controlled units, 24/7 surveillance, and inventory management. Short-term and long-term rentals available.',
    categoryName: 'Logistics', ownerEmail: 'logistics@seed.dev', sector: 'Logistics' as Sector,
    location: { address: '9 Lekki-Epe Expressway', city: 'Lekki', state: 'Lagos', country: 'Nigeria', latitude: 6.4658, longitude: 3.6738 },
    contact: { phone: '+234-809-333-4455', email: 'info@securestore.ng', website: 'https://securestore.ng', whatsapp: '+234-809-333-4455' },
    pricing: { minimum: 30000, maximum: 300000, currency: 'NGN' },
    operatingHours: { monday: { open: '06:00', close: '22:00' }, tuesday: { open: '06:00', close: '22:00' }, wednesday: { open: '06:00', close: '22:00' }, thursday: { open: '06:00', close: '22:00' }, friday: { open: '06:00', close: '22:00' }, saturday: { open: '07:00', close: '18:00' } },
    features: ['Climate Control', '24/7 Security', 'Inventory Management', 'Flexible Leases', 'Loading Dock'],
    images: ['https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800'],
    averageRating: 4.3, reviewCount: 76,
  },
  // ── Professional Services ──
  {
    title: 'Apex Consulting Group', slug: 'apex-consulting-group',
    description: 'Strategic business consulting firm helping SMEs and enterprises optimize operations, drive growth, and achieve digital transformation. Proven track record across multiple industries.',
    categoryName: 'Professional Services', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '10 Bishop Oluwole Street', city: 'Victoria Island', state: 'Lagos', country: 'Nigeria', latitude: 6.4289, longitude: 3.4162 },
    contact: { phone: '+234-802-444-5566', email: 'info@apexconsulting.ng', website: 'https://apexconsulting.ng', whatsapp: '+234-802-444-5566' },
    pricing: { minimum: 100000, maximum: 1500000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' }, wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' }, friday: { open: '08:00', close: '17:00' }, saturday: { open: '09:00', close: '14:00' } },
    features: ['Business Strategy', 'Digital Transformation', 'Market Research', 'Process Optimization', 'Training Programs'],
    images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'],
    averageRating: 4.7, reviewCount: 112,
  },
  {
    title: 'LegalEagle Associates', slug: 'legaleagle-associates',
    description: 'Full-service law firm specializing in corporate law, property transactions, dispute resolution, and business registration. Decades of combined legal experience.',
    categoryName: 'Professional Services', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '33 Marina Street', city: 'Lagos Island', state: 'Lagos', country: 'Nigeria', latitude: 6.4550, longitude: 3.3941 },
    contact: { phone: '+234-805-555-6677', email: 'info@legaleagleassociates.com', website: 'https://legaleagleassociates.com', whatsapp: '+234-805-555-6677' },
    pricing: { minimum: 50000, maximum: 1000000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:30', close: '17:30' }, tuesday: { open: '08:30', close: '17:30' }, wednesday: { open: '08:30', close: '17:30' }, thursday: { open: '08:30', close: '17:30' }, friday: { open: '08:30', close: '16:00' }, saturday: { open: '09:00', close: '13:00' } },
    features: ['Corporate Law', 'Property Transactions', 'Dispute Resolution', 'Business Registration', 'Contract Review'],
    images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800'],
    averageRating: 4.5, reviewCount: 89,
  },
  {
    title: 'NexGen Financial Advisors', slug: 'nexgen-financial-advisors',
    description: 'Financial planning and investment advisory firm helping individuals and businesses build wealth, manage risk, and plan for retirement. SEC-registered.',
    categoryName: 'Professional Services', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '17 Raymond Njoku Street', city: 'Ikoyi', state: 'Lagos', country: 'Nigeria', latitude: 6.4468, longitude: 3.4049 },
    contact: { phone: '+234-808-666-7788', email: 'hello@nexgenfinancial.ng', website: 'https://nexgenfinancial.ng', whatsapp: '+234-808-666-7788' },
    pricing: { minimum: 25000, maximum: 500000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '17:00' }, tuesday: { open: '08:00', close: '17:00' }, wednesday: { open: '08:00', close: '17:00' }, thursday: { open: '08:00', close: '17:00' }, friday: { open: '08:00', close: '16:00' }, saturday: { open: '09:00', close: '13:00' } },
    features: ['Investment Planning', 'Retirement Planning', 'Tax Advisory', 'Risk Management', 'Estate Planning'],
    images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'],
    averageRating: 4.6, reviewCount: 145,
  },
  // ── Technology ──
  {
    title: 'CodeCraft Solutions', slug: 'codecraft-solutions',
    description: 'Full-stack software development agency building custom web and mobile applications. From MVP to enterprise-grade platforms, our team delivers scalable solutions.',
    categoryName: 'Technology', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '5 Adeyemi Lawson Street', city: 'Ikoyi', state: 'Lagos', country: 'Nigeria', latitude: 6.4494, longitude: 3.4058 },
    contact: { phone: '+234-809-777-8899', email: 'hello@codecraft.ng', website: 'https://codecraft.ng', whatsapp: '+234-809-777-8899' },
    pricing: { minimum: 500000, maximum: 5000000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' }, wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' }, friday: { open: '08:00', close: '17:00' }, saturday: { open: '10:00', close: '15:00' } },
    features: ['Web Development', 'Mobile Apps', 'UI/UX Design', 'API Integration', 'Cloud Deployment'],
    images: ['https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800'],
    averageRating: 4.9, reviewCount: 67,
  },
  {
    title: 'TechFix Pro', slug: 'techfix-pro',
    description: 'Reliable computer repair and IT support service for homes and businesses. Hardware repair, virus removal, network setup, and managed IT services.',
    categoryName: 'Technology', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '30 Adeniran Ogunsanya Street', city: 'Surulere', state: 'Lagos', country: 'Nigeria', latitude: 6.5008, longitude: 3.3538 },
    contact: { phone: '+234-803-888-9900', email: 'support@techfixpro.ng', website: 'https://techfixpro.ng', whatsapp: '+234-803-888-9900' },
    pricing: { minimum: 5000, maximum: 200000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '19:00' }, tuesday: { open: '08:00', close: '19:00' }, wednesday: { open: '08:00', close: '19:00' }, thursday: { open: '08:00', close: '19:00' }, friday: { open: '08:00', close: '19:00' }, saturday: { open: '09:00', close: '17:00' } },
    features: ['Hardware Repair', 'Virus Removal', 'Network Setup', 'Data Recovery', 'On-Site Support'],
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800'],
    averageRating: 4.3, reviewCount: 189,
  },
  {
    title: 'CloudBase IT Services', slug: 'cloudbase-it-services',
    description: 'Enterprise cloud infrastructure and managed IT services. AWS, Azure, and Google Cloud consulting, migration, and 24/7 monitoring.',
    categoryName: 'Technology', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '8a Ajose Adeogun Street', city: 'Utako', state: 'Abuja', country: 'Nigeria', latitude: 9.0446, longitude: 7.4909 },
    contact: { phone: '+234-806-999-0011', email: 'info@cloudbaseit.com', website: 'https://cloudbaseit.com', whatsapp: '+234-806-999-0011' },
    pricing: { minimum: 100000, maximum: 2000000, currency: 'NGN' },
    operatingHours: { monday: { open: '00:00', close: '23:59' }, tuesday: { open: '00:00', close: '23:59' }, wednesday: { open: '00:00', close: '23:59' }, thursday: { open: '00:00', close: '23:59' }, friday: { open: '00:00', close: '23:59' }, saturday: { open: '00:00', close: '23:59' }, sunday: { open: '00:00', close: '23:59' } },
    features: ['Cloud Migration', '24/7 Monitoring', 'Security Audit', 'DevOps Consulting', 'Disaster Recovery'],
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'],
    averageRating: 4.7, reviewCount: 53,
  },
  // ── Retail ──
  {
    title: 'Urban Mart', slug: 'urban-mart',
    description: 'One-stop department store offering groceries, electronics, fashion, home goods, and more. Competitive prices with weekly promotions and loyalty rewards.',
    categoryName: 'Retail', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '25 Adeniyi Jones Avenue', city: 'Ikeja', state: 'Lagos', country: 'Nigeria', latitude: 6.5967, longitude: 3.3485 },
    contact: { phone: '+234-802-111-2233', email: 'care@urbanmart.ng', website: 'https://urbanmart.ng', whatsapp: '+234-802-111-2233' },
    pricing: { minimum: 500, maximum: 500000, currency: 'NGN' },
    operatingHours: { monday: { open: '07:00', close: '21:00' }, tuesday: { open: '07:00', close: '21:00' }, wednesday: { open: '07:00', close: '21:00' }, thursday: { open: '07:00', close: '21:00' }, friday: { open: '07:00', close: '21:00' }, saturday: { open: '07:00', close: '21:00' }, sunday: { open: '10:00', close: '18:00' } },
    features: ['Wide Product Range', 'Weekly Deals', 'Loyalty Program', 'Home Delivery', 'Free Parking'],
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
    averageRating: 4.1, reviewCount: 345,
  },
  {
    title: 'EcoGoods Store', slug: 'ecogoods-store',
    description: 'Sustainable lifestyle store offering eco-friendly products including reusable household items, organic personal care, and ethically sourced home decor.',
    categoryName: 'Retail', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '14 Idowu Martins Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria', latitude: 6.4359, longitude: 3.4112 },
    contact: { phone: '+234-808-222-3344', email: 'hello@ecogoods.ng', website: 'https://ecogoods.ng', whatsapp: '+234-808-222-3344' },
    pricing: { minimum: 2000, maximum: 80000, currency: 'NGN' },
    operatingHours: { monday: { open: '09:00', close: '19:00' }, tuesday: { open: '09:00', close: '19:00' }, wednesday: { open: '09:00', close: '19:00' }, thursday: { open: '09:00', close: '19:00' }, friday: { open: '09:00', close: '19:00' }, saturday: { open: '09:00', close: '18:00' } },
    features: ['Eco-Friendly Products', 'Plastic-Free Packaging', 'Organic Certified', 'Recycling Program', 'Local Sourcing'],
    images: ['https://images.unsplash.com/photo-1534723328310-e82abd3f404b?w=800'],
    averageRating: 4.6, reviewCount: 78,
  },
  {
    title: 'TrendStyle Fashion', slug: 'trendstyle-fashion',
    description: 'Contemporary fashion boutique offering curated collections of clothing, accessories, and footwear for men and women. Personal styling services available.',
    categoryName: 'Retail', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '55 Toyin Street', city: 'Ikeja', state: 'Lagos', country: 'Nigeria', latitude: 6.5992, longitude: 3.3501 },
    contact: { phone: '+234-803-333-4455', email: 'shop@trendstyle.ng', website: 'https://trendstyle.ng', whatsapp: '+234-803-333-4455' },
    pricing: { minimum: 5000, maximum: 150000, currency: 'NGN' },
    operatingHours: { monday: { open: '09:00', close: '20:00' }, tuesday: { open: '09:00', close: '20:00' }, wednesday: { open: '09:00', close: '20:00' }, thursday: { open: '09:00', close: '20:00' }, friday: { open: '09:00', close: '20:00' }, saturday: { open: '09:00', close: '20:00' }, sunday: { open: '12:00', close: '18:00' } },
    features: ['Personal Styling', 'New Arrivals Weekly', 'Alterations', 'Online Shopping', 'Free Delivery'],
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    averageRating: 4.4, reviewCount: 156,
  },
  // ── Real Estate ──
  {
    title: 'Prime Properties Agency', slug: 'prime-properties-agency',
    description: 'Leading real estate brokerage connecting buyers and sellers across Lagos. Specializing in luxury homes, commercial properties, and land investment opportunities.',
    categoryName: 'Real Estate', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '3 Ribadu Road', city: 'Ikoyi', state: 'Lagos', country: 'Nigeria', latitude: 6.4479, longitude: 3.4081 },
    contact: { phone: '+234-809-444-5566', email: 'info@primeproperties.ng', website: 'https://primeproperties.ng', whatsapp: '+234-809-444-5566' },
    pricing: { minimum: 50000000, maximum: 500000000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' }, wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' }, friday: { open: '08:00', close: '17:00' }, saturday: { open: '09:00', close: '17:00' }, sunday: { open: '10:00', close: '14:00' } },
    features: ['Property Sales', 'Land Investment', 'Valuation Services', 'Legal Assistance', 'Mortgage Advisory'],
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    averageRating: 4.5, reviewCount: 201,
  },
  {
    title: 'HomeFinders Property Management', slug: 'homefinders-property-management',
    description: 'Comprehensive property management services for landlords and tenants. Tenant screening, rent collection, maintenance, and 24/7 support for residential properties.',
    categoryName: 'Real Estate', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '6 Gerrard Road', city: 'Ikoyi', state: 'Lagos', country: 'Nigeria', latitude: 6.4477, longitude: 3.4034 },
    contact: { phone: '+234-805-555-6677', email: 'hello@homefinderspm.ng', website: 'https://homefinderspm.ng', whatsapp: '+234-805-555-6677' },
    pricing: { minimum: 50000, maximum: 200000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '17:30' }, tuesday: { open: '08:00', close: '17:30' }, wednesday: { open: '08:00', close: '17:30' }, thursday: { open: '08:00', close: '17:30' }, friday: { open: '08:00', close: '16:00' }, saturday: { open: '09:00', close: '15:00' } },
    features: ['Tenant Screening', 'Rent Collection', 'Maintenance', '24/7 Support', 'Financial Reporting'],
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
    averageRating: 4.2, reviewCount: 134,
  },
  {
    title: 'GreenView Realty', slug: 'greenview-realty',
    description: 'Full-service real estate agency focused on residential and commercial properties in emerging neighborhoods. We help first-time buyers, investors, and businesses find the perfect space.',
    categoryName: 'Real Estate', ownerEmail: 'apex@seed.dev', sector: 'Education' as Sector,
    location: { address: '29 Ademola Adetokunbo Street', city: 'Wuse 2', state: 'Abuja', country: 'Nigeria', latitude: 9.0715, longitude: 7.4898 },
    contact: { phone: '+234-806-666-7788', email: 'info@greenviewrealty.ng', website: 'https://greenviewrealty.ng', whatsapp: '+234-806-666-7788' },
    pricing: { minimum: 15000000, maximum: 250000000, currency: 'NGN' },
    operatingHours: { monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' }, wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' }, friday: { open: '08:00', close: '17:00' }, saturday: { open: '09:00', close: '16:00' } },
    features: ['Residential Sales', 'Commercial Leasing', 'Property Valuation', 'Investment Advisory', 'Documentation'],
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    averageRating: 4.3, reviewCount: 98,
  },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }
  const categoryCount = await prisma.category.count();
  console.log(`Done. ${categoryCount} categories seeded.`);

  const allCategories = await prisma.category.findMany();
  const catMap = new Map(allCategories.map((c) => [c.name, c.id]));

  console.log('Seeding users...');
  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, isVerified: u.isVerified, role: u.role },
      create: { ...u, password: hashedPassword },
    });
  }
  const userCount = await prisma.user.count();
  console.log(`Done. ${userCount} users seeded.`);

  const allUsers = await prisma.user.findMany();
  const userMap = new Map(allUsers.map((u) => [u.email, u.id]));

  console.log('Seeding listings...');
  for (const listing of listings) {
    const categoryId = catMap.get(listing.categoryName);
    const ownerId = userMap.get(listing.ownerEmail);
    if (!categoryId) { console.warn(`Category "${listing.categoryName}" not found, skipping "${listing.title}"`); continue; }
    if (!ownerId) { console.warn(`Owner "${listing.ownerEmail}" not found, skipping "${listing.title}"`); continue; }

    await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: {
        title: listing.title,
        description: listing.description,
        categoryId,
        ownerId,
        sector: listing.sector,
        location: listing.location,
        contact: listing.contact,
        pricing: listing.pricing,
        operatingHours: listing.operatingHours,
        features: listing.features,
        images: listing.images,
        averageRating: listing.averageRating,
        reviewCount: listing.reviewCount,
        verified: 'VERIFIED' as VerificationStatus,
        status: 'APPROVED' as ListingStatus,
      },
      create: {
        title: listing.title,
        slug: listing.slug,
        description: listing.description,
        categoryId,
        ownerId,
        sector: listing.sector,
        location: listing.location,
        contact: listing.contact,
        pricing: listing.pricing,
        operatingHours: listing.operatingHours,
        features: listing.features,
        images: listing.images,
        averageRating: listing.averageRating,
        reviewCount: listing.reviewCount,
        verified: 'VERIFIED' as VerificationStatus,
        status: 'APPROVED' as ListingStatus,
      },
    });
  }
  const listingCount = await prisma.listing.count();
  console.log(`Done. ${listingCount} listings seeded.`);
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
