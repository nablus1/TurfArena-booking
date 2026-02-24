import { prisma } from '../src/lib/prisma';

async function main() {
  // Configuration
  const startDate = new Date(); // Today
  const daysToSeed = 7;         // Number of next days to create slots for
  const dailySlots = [
    { startTime: '06:00', endTime: '07:00', price: 2000 },
    { startTime: '07:00', endTime: '08:00', price: 2000 },
    { startTime: '08:00', endTime: '09:00', price: 2000 },
    { startTime: '09:00', endTime: '10:00', price: 2000 },
    { startTime: '10:00', endTime: '11:00', price: 2000 },
    { startTime: '11:00', endTime: '12:00', price: 2000 },
    { startTime: '12:00', endTime: '13:00', price: 2000 },
    { startTime: '13:00', endTime: '14:00', price: 2000 },
    { startTime: '14:00', endTime: '15:00', price: 2000 },
    { startTime: '15:00', endTime: '16:00', price: 2000 },
    { startTime: '16:00', endTime: '17:00', price: 2000 },
    { startTime: '17:00', endTime: '18:00', price: 2000 },
    { startTime: '18:00', endTime: '19:00', price: 2500 },
    { startTime: '19:00', endTime: '20:00', price: 2500 },
    { startTime: '20:00', endTime: '21:00', price: 2500 },
    { startTime: '21:00', endTime: '22:00', price: 2500 },
  ];

  for (let day = 0; day < daysToSeed; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);

    for (const slot of dailySlots) {
      await prisma.timeSlot.create({
        data: {
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
          price: slot.price,
          maxBookings: 22,
        },
      });
    }
  }

  console.log(`✅ Seeded ${dailySlots.length * daysToSeed} time slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
