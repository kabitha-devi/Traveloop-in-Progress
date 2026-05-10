const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@traveloop.app' },
    update: {},
    create: {
      email: 'admin@traveloop.app',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Traveloop',
      role: 'ADMIN',
      country: 'India',
      bio: 'Platform administrator',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'jayachandran@traveloop.app' },
    update: {},
    create: {
      email: 'jayachandran@traveloop.app',
      passwordHash,
      firstName: 'Jayachandran',
      lastName: 'S',
      country: 'India',
      bio: 'Adventure traveler and tech enthusiast',
    },
  });

  console.log('✅ Users seeded');

  // ── Cities ──
  const cities = [
    { name: 'Paris', country: 'France', region: 'Europe', lat: 48.8566, lng: 2.3522, costIndex: 5, popularity: 98, description: 'City of lights, art, and romance' },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.6762, lng: 139.6503, costIndex: 4, popularity: 95, description: 'Ancient temples meet neon-lit streets' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', lat: -8.3405, lng: 115.092, costIndex: 2, popularity: 92, description: 'Tropical paradise of temples and rice terraces' },
    { name: 'New York', country: 'USA', region: 'North America', lat: 40.7128, lng: -74.006, costIndex: 5, popularity: 97, description: 'The city that never sleeps' },
    { name: 'Kochi', country: 'India', region: 'Asia', lat: 9.9312, lng: 76.2673, costIndex: 1, popularity: 60, description: 'Gateway to Kerala backwaters' },
    { name: 'Munnar', country: 'India', region: 'Asia', lat: 10.0889, lng: 77.0595, costIndex: 1, popularity: 55, description: 'Misty tea plantations in the Western Ghats' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', lat: 41.3874, lng: 2.1686, costIndex: 4, popularity: 90, description: 'Gaudi architecture and Mediterranean vibes' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa', lat: -33.9249, lng: 18.4241, costIndex: 3, popularity: 75, description: 'Table Mountain and stunning coastlines' },
    { name: 'Marrakech', country: 'Morocco', region: 'Africa', lat: 31.6295, lng: -7.9811, costIndex: 2, popularity: 70, description: 'Vibrant souks and ancient medinas' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', lat: 35.0116, lng: 135.7681, costIndex: 4, popularity: 88, description: 'Ancient capital with 2000 temples and shrines' },
    { name: 'Reykjavik', country: 'Iceland', region: 'Europe', lat: 64.1466, lng: -21.9426, costIndex: 5, popularity: 65, description: 'Northern lights and volcanic landscapes' },
    { name: 'Cusco', country: 'Peru', region: 'South America', lat: -13.532, lng: -71.9675, costIndex: 2, popularity: 72, description: 'Gateway to Machu Picchu and Inca heritage' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: city,
      create: city,
    });
  }

  console.log('✅ Cities seeded');

  // ── Sample Trip ──
  const trip = await prisma.trip.create({
    data: {
      userId: user1.id,
      name: 'Kerala Dream Escape',
      description: 'A relaxing journey through God\'s Own Country',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-07'),
      status: 'UPCOMING',
      totalBudget: 25000,
      mood: 'relax',
      source: 'manual',
      isPublic: true,
      stops: {
        create: [
          {
            cityName: 'Kochi', country: 'India',
            lat: 9.9312, lng: 76.2673,
            startDate: new Date('2026-06-01'),
            endDate: new Date('2026-06-03'),
            budget: 8000, position: 0,
            activities: {
              create: [
                { name: 'Fort Kochi Heritage Walk', category: 'Culture', cost: 0, duration: '2 hours', position: 0, description: 'Walk through colonial streets and Chinese fishing nets' },
                { name: 'Backwater Houseboat Cruise', category: 'Adventure', cost: 3500, duration: '4 hours', position: 1, description: 'Cruise through serene backwater canals' },
                { name: 'Kathakali Performance', category: 'Culture', cost: 500, duration: '2 hours', position: 2, description: 'Traditional Kerala dance drama' },
              ],
            },
          },
          {
            cityName: 'Munnar', country: 'India',
            lat: 10.0889, lng: 77.0595,
            startDate: new Date('2026-06-03'),
            endDate: new Date('2026-06-07'),
            budget: 12000, position: 1,
            activities: {
              create: [
                { name: 'Eravikulam National Park', category: 'Nature', cost: 300, duration: '3 hours', position: 0, description: 'Home of the Nilgiri Tahr' },
                { name: 'Tea Museum Visit', category: 'Culture', cost: 200, duration: '1.5 hours', position: 1, description: 'Learn about tea processing and tasting' },
                { name: 'Mattupetty Dam Trek', category: 'Adventure', cost: 0, duration: '3 hours', position: 2, description: 'Scenic trek around the dam and reservoir' },
                { name: 'Anamudi Peak Viewpoint', category: 'Nature', cost: 0, duration: '2 hours', position: 3, description: 'Highest peak in South India' },
              ],
            },
          },
        ],
      },
    },
  });

  // Add group member (owner)
  await prisma.groupMember.create({
    data: { tripId: trip.id, userId: user1.id, role: 'OWNER' },
  });

  // Add checklist items
  const checklistItems = [
    { label: 'Passport', category: 'Documents', essential: true },
    { label: 'Sunscreen SPF 50', category: 'Toiletries', essential: true },
    { label: 'Rain jacket', category: 'Clothing', essential: true },
    { label: 'Hiking shoes', category: 'Footwear', essential: true },
    { label: 'Camera + charger', category: 'Electronics', essential: false },
    { label: 'Power bank', category: 'Electronics', essential: true },
    { label: 'Mosquito repellent', category: 'Health', essential: true },
  ];

  for (const item of checklistItems) {
    await prisma.checklistItem.create({
      data: { tripId: trip.id, ...item },
    });
  }

  // Add sample notes
  await prisma.note.create({
    data: {
      tripId: trip.id,
      title: 'Packing reminder',
      body: 'Don\'t forget the camera lens filters and extra SD cards!',
      day: 1,
    },
  });

  console.log('✅ Sample trip seeded');

  // ── Emergency Contacts ──
  await prisma.emergencyContact.create({
    data: {
      userId: user1.id,
      name: 'Emergency Contact',
      phone: '+91-9876543210',
      relation: 'Family',
    },
  });

  console.log('✅ Emergency contacts seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
