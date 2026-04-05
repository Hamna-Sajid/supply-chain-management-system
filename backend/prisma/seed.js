import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding started...');

  // 1. Clean existing data (Optional - use with caution)
  // await prisma.rawMaterial.deleteMany({});
  // await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // 2. Create or Update a Supplier (using upsert for idempotency)
  // Note: We manually handle the ID to match your teammate's logic
  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@iba.edu.pk' },
    update: {
      name: 'Hamna Bulk Materials',
      password: hashedPassword,
      role: 'supplier',
      contact_number: '03001234567',
      address: 'IBA Main Campus, Karachi'
    },
    create: {
      user_id: 'SUP_00001',
      name: 'Hamna Bulk Materials',
      email: 'supplier@iba.edu.pk',
      password: hashedPassword,
      role: 'supplier',
      contact_number: '03001234567',
      address: 'IBA Main Campus, Karachi'
    }
  });

  console.log(`Created Supplier: ${supplier.name} (${supplier.user_id})`);

  // 3. Create Initial Raw Materials for this Supplier
  await prisma.rawMaterial.createMany({
    data: [
      {
        material_id: crypto.randomUUID(),
        material_name: 'Premium Cotton',
        description: 'High-grade raw cotton for textile manufacturing',
        quantity_available: 1200,
        unit_price: 45.50,
        supplier_id: supplier.user_id
      },
      {
        material_id: crypto.randomUUID(),
        material_name: 'Polyester Thread',
        description: 'Durable synthetic thread in bulk',
        quantity_available: 5000,
        unit_price: 12.00,
        supplier_id: supplier.user_id
      }
    ]
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });