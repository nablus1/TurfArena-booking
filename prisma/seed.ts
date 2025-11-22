import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jujaturf.co.ke' },
    update: {},
    create: {
      email: 'admin@jujaturf.co.ke',
      name: 'Admin User',
      phone: '254712345678',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✓ Admin created:', admin.email);

  // Create time slots for next 7 days
  const today = new Date();
  const slots = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    date.setHours(0, 0, 0, 0);

    // Create slots from 6 AM to 10 PM
    for (let hour = 6; hour < 22; hour++) {
      slots.push({
        date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        price: 2500,
        isAvailable: true,
      });
    }
  }

  await prisma.timeSlot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  console.log(`✓ Created ${slots.length} time slots`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });