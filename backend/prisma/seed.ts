import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
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

async function main() {
  console.log('Seeding categories...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }

  const count = await prisma.category.count();
  console.log(`Done. ${count} categories seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
