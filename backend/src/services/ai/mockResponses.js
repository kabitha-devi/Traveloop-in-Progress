// mockResponses.js – provides deterministic, destination-aware mock data when AI API key is absent.

// ─── Real Destination Data ───
const DESTINATIONS = {
  tirupati: {
    region: 'Andhra Pradesh, India',
    bestTime: 'September to March',
    tips: [
      'Book Tirumala darshan tickets online at least 2 weeks in advance',
      'Wear traditional attire (dhoti/saree) for temple entry',
      'Try Tirupati Laddu — the iconic temple prasadam',
      'Start early to avoid crowds at the main temple',
    ],
    stops: [
      {
        cityLabel: 'Tirupati City',
        days: 2,
        hotel: { name: 'Bhimas Residency Tirupati', pricePerNight: null },
        activities: [
          { name: 'Tirumala Venkateswara Temple', time: '05:00', duration: '4 hours', cost: 0, type: 'Spiritual', description: 'One of the most visited pilgrimage sites in the world, home to Lord Venkateswara' },
          { name: 'Sri Padmavathi Ammavari Temple', time: '10:00', duration: '2 hours', cost: 0, type: 'Spiritual', description: 'Ancient temple dedicated to Goddess Padmavathi, consort of Venkateswara' },
          { name: 'Tirupati Local Food Trail', time: '13:00', duration: '2 hours', cost: null, type: 'Food', description: 'Try famous Tirupati Dosa, Pulihora, and the iconic Tirupati Laddu' },
          { name: 'ISKCON Tirupati Temple', time: '17:00', duration: '1.5 hours', cost: 0, type: 'Spiritual', description: 'Peaceful Hare Krishna temple with beautiful architecture and evening aarti' },
        ],
        transport: { from: 'Tirupati Airport / Railway Station', to: 'Tirupati City', mode: 'Auto Rickshaw', cost: null },
      },
      {
        cityLabel: 'Tirumala Hills',
        days: 1,
        hotel: { name: 'TTD Guest House Tirumala', pricePerNight: null },
        activities: [
          { name: 'Tirumala Ghat Road Scenic Drive', time: '06:00', duration: '1 hour', cost: 0, type: 'Nature', description: '11-km winding ghat road through forest with spectacular valley views' },
          { name: 'Akasaganga Teertham Waterfall', time: '09:00', duration: '1.5 hours', cost: 0, type: 'Nature', description: 'Sacred waterfall mentioned in ancient scriptures, used for pilgrimage rituals' },
          { name: 'Silathoranam Natural Rock Formation', time: '11:00', duration: '1 hour', cost: 0, type: 'Nature', description: 'A naturally formed arch in rock — a geological wonder unique to Tirumala hills' },
          { name: 'Japali Hanuman Temple', time: '14:00', duration: '1.5 hours', cost: 0, type: 'Spiritual', description: 'Ancient cave temple dedicated to Lord Hanuman, set amid lush greenery' },
        ],
        transport: { from: 'Tirupati City', to: 'Tirumala Hills', mode: 'TTD Bus', cost: null },
      },
    ],
  },
  kerala: {
    region: 'Kerala, India',
    bestTime: 'October to February',
    tips: [
      'Book houseboat stays in Alleppey at least a week in advance',
      'Carry light cotton clothes — Kerala is humid year-round',
      'Try a traditional Kerala Sadya (banana leaf meal)',
    ],
    stops: [
      {
        cityLabel: 'Kochi',
        days: 2,
        hotel: { name: 'Heritage Hotel Fort Kochi', pricePerNight: null },
        activities: [
          { name: 'Fort Kochi Walk', time: '08:00', duration: '2.5 hours', cost: 0, type: 'Culture', description: 'Explore colonial heritage, Chinese fishing nets, and St Francis Church' },
          { name: 'Kerala Kathakali Show', time: '17:00', duration: '2 hours', cost: null, type: 'Culture', description: 'Watch the famous classical dance form of Kerala in its birthplace' },
          { name: 'Mattancherry Spice Market', time: '10:00', duration: '1.5 hours', cost: 0, type: 'Shopping', description: 'Browse spices, cashews, and antiques in this 500-year-old market district' },
        ],
        transport: { from: 'Kochi Airport', to: 'Fort Kochi', mode: 'Ferry / Taxi', cost: null },
      },
      {
        cityLabel: 'Alleppey (Backwaters)',
        days: 2,
        hotel: { name: 'Kerala Houseboat Stay', pricePerNight: null },
        activities: [
          { name: 'Alleppey Backwater Cruise', time: '10:00', duration: '6 hours', cost: null, type: 'Adventure', description: 'Cruise through emerald canals on a traditional kettuvallam houseboat' },
          { name: 'Marari Beach', time: '06:00', duration: '2 hours', cost: 0, type: 'Nature', description: 'Pristine, uncrowded beach great for sunrise walks and swimming' },
        ],
        transport: { from: 'Kochi', to: 'Alleppey', mode: 'Tourist Bus / Boat', cost: null },
      },
    ],
  },
  goa: {
    region: 'Goa, India',
    bestTime: 'November to February',
    tips: [
      'Book beach shacks and hotels early — Goa gets crowded in peak season',
      'Rent a scooter — best way to explore beaches and villages',
      'Try Goan fish curry, prawn balchão, and bebinca dessert',
    ],
    stops: [
      {
        cityLabel: 'North Goa',
        days: 2,
        hotel: { name: 'Calangute Beach Resort', pricePerNight: null },
        activities: [
          { name: 'Baga Beach Sunrise', time: '06:00', duration: '2 hours', cost: 0, type: 'Nature', description: 'Iconic Goa beach perfect for sunrise, water sports, and beach shack breakfasts' },
          { name: 'Fort Aguada', time: '09:00', duration: '2 hours', cost: null, type: 'Culture', description: '17th-century Portuguese fort with stunning views of the Arabian Sea' },
          { name: 'Calangute Market Night', time: '19:00', duration: '3 hours', cost: 0, type: 'Shopping', description: 'Vibrant night market with clothes, handicrafts, food, and live music' },
        ],
        transport: { from: 'Goa Airport', to: 'North Goa', mode: 'Taxi', cost: null },
      },
      {
        cityLabel: 'South Goa',
        days: 2,
        hotel: { name: 'Palolem Beach Cottage', pricePerNight: null },
        activities: [
          { name: 'Palolem Beach Kayaking', time: '08:00', duration: '3 hours', cost: null, type: 'Adventure', description: 'Crystal-clear crescent-shaped bay perfect for kayaking and dolphin spotting' },
          { name: 'Dudhsagar Waterfall Trek', time: '07:00', duration: '5 hours', cost: null, type: 'Adventure', description: 'One of India\'s tallest waterfalls, accessible by jeep safari through jungle' },
        ],
        transport: { from: 'North Goa', to: 'South Goa', mode: 'Local Bus / Scooter', cost: null },
      },
    ],
  },
  coimbatore: {
    region: 'Tamil Nadu, India',
    bestTime: 'October to February',
    tips: [
      'Known as "Manchester of South India" — visit textile markets for great deals',
      'Marudamalai temple is best visited at dawn before crowds arrive',
      'Try Annapoorna restaurant for authentic Coimbatore meals',
      'Dhyanalinga at Isha Foundation is 30 km from the city — go early',
    ],
    stops: [{
      cityLabel: 'Coimbatore',
      days: 3,
      hotel: { name: 'Hotel Residency Comforts, Race Course Road', pricePerNight: null },
      activities: [
        { name: 'Marudamalai Murugan Temple', time: '06:00', duration: '2 hours', cost: 0, type: 'Spiritual', description: 'Ancient hilltop temple on Nilgiri foothills dedicated to Lord Murugan with panoramic city views' },
        { name: 'Gedee Car Museum', time: '10:00', duration: '2 hours', cost: 5, type: 'Culture', description: 'Remarkable private collection of 200+ vintage cars, motorcycles, and aircraft' },
        { name: 'Perur Pateeswarar Temple', time: '08:00', duration: '1.5 hours', cost: 0, type: 'Spiritual', description: '2000-year-old Shiva temple with stunning Dravidian architecture and intricate carvings' },
        { name: 'VOC Park & Zoo', time: '09:00', duration: '3 hours', cost: 3, type: 'Nature', description: 'Large urban park and zoo with 100+ animal species including lions, tigers, and rare birds' },
        { name: 'Coimbatore Food Trail', time: '18:00', duration: '2 hours', cost: 10, type: 'Food', description: 'Taste famous Parotta Salna, Kothu Parotta, Annapoorna meals, and filter coffee' },
        { name: 'Dhyanalinga Yoga Temple', time: '09:00', duration: '2.5 hours', cost: 0, type: 'Wellness', description: "Sadhguru's Isha Foundation campus — world-class meditation space and eco-campus" },
      ],
      transport: { from: 'Coimbatore Airport', to: 'Coimbatore City', mode: 'Taxi / Airport Shuttle', cost: null },
    }],
  },
};

// ─── Destination Lookup ───
function matchDestination(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('tirupati') || t.includes('tirumala') || t.includes('venkateswara')) return DESTINATIONS.tirupati;
  if (t.includes('kerala') || t.includes('kochi') || t.includes('alleppey') || t.includes('munnar')) return DESTINATIONS.kerala;
  if (t.includes('goa') || t.includes('palolem') || t.includes('baga') || t.includes('calangute')) return DESTINATIONS.goa;
  if (t.includes('coimbatore') || t.includes('kovai')) return DESTINATIONS.coimbatore;
  return null;
}

// ─── Scale costs to budget ───
function scaleCosts(dest, budget) {
  const totalBaseActivitiesCost = dest.stops.reduce((sum, stop) =>
    sum + stop.activities.reduce((aSum, a) => aSum + (a.cost === null ? 50 : a.cost === 0 ? 0 : a.cost), 0), 0);

  const accommodation = Math.floor(budget * 0.40);
  const transport = Math.floor(budget * 0.15);
  const food = Math.floor(budget * 0.25);
  const activitiesTotal = Math.floor(budget * 0.15);
  const misc = budget - accommodation - transport - food - activitiesTotal;

  const stopsCount = dest.stops.length;
  const totalDays = dest.stops.reduce((s, st) => s + st.days, 0) || 5;
  const dailyHotel = Math.floor(accommodation / totalDays);
  const perActBudget = totalBaseActivitiesCost > 0 ? activitiesTotal / totalBaseActivitiesCost : 1;

  return {
    stops: dest.stops.map((stop, si) => ({
      city: stop.cityLabel,
      days: stop.days,
      activities: stop.activities.map(a => ({
        ...a,
        cost: a.cost === 0 ? 0 : Math.max(0, Math.round((a.cost === null ? 50 : a.cost) * perActBudget)),
      })),
      hotel: { name: stop.hotel.name, pricePerNight: dailyHotel },
      transport: { ...stop.transport, cost: Math.floor(transport / stopsCount) },
    })),
    budgetBreakdown: { accommodation, transport, food, activities: activitiesTotal, misc },
  };
}

function getMockResponse(feature, userMessage, extraContext) {
  // ─── Parse destination and budget: prefer explicit extraContext ───
  let rawDestination = extraContext?.destination || 'your destination';
  let budget = extraContext?.budget || null;

  // Only fall back to regex if not provided directly
  if (!budget && userMessage) {
    const budgetMatch = userMessage.match(/Maximum Budget:\s*\$(\d+)/i) ||
                        userMessage.match(/Budget:\s*\$(\d+)/i) ||
                        userMessage.match(/\$(\d+)/i);
    if (budgetMatch) budget = parseInt(budgetMatch[1], 10);
  }
  if (!budget) budget = 5000; // last resort default

  if (!rawDestination || rawDestination === 'your destination') {
    if (userMessage) {
      const tripMatch = userMessage.match(/trip:\s*"([^"]+)"/i) ||
                        userMessage.match(/trip to\s+([^."]+)/i);
      if (tripMatch) rawDestination = tripMatch[1].trim();
    }
  }

  const capitalDest = rawDestination.charAt(0).toUpperCase() + rawDestination.slice(1);
  const destData = matchDestination(rawDestination);

  const accommodation = Math.floor(budget * 0.40);
  const transport = Math.floor(budget * 0.15);
  const food = Math.floor(budget * 0.25);
  const activitiesTotal = Math.floor(budget * 0.15);
  const misc = budget - accommodation - transport - food - activitiesTotal;
  const dailyHotel = Math.floor(accommodation / 5);

  let tripStops, budgetBreakdown, tips;

  if (destData) {
    const scaled = scaleCosts(destData, budget);
    tripStops = scaled.stops;
    budgetBreakdown = scaled.budgetBreakdown;
    tips = destData.tips;
  } else {
    // Generic but at least uses the real destination name
    tripStops = [
      {
        city: capitalDest,
        days: 3,
        activities: [
          { name: `${capitalDest} Heritage Walk`, time: '09:00', duration: '3 hours', cost: 0, type: 'Culture', description: `Explore the historic landmarks and culture of ${capitalDest}` },
          { name: `${capitalDest} Local Food Trail`, time: '13:00', duration: '2 hours', cost: Math.floor(activitiesTotal * 0.3), type: 'Food', description: `Savour the authentic local cuisine of ${capitalDest}` },
          { name: `${capitalDest} Main Attraction`, time: '16:00', duration: '2.5 hours', cost: Math.floor(activitiesTotal * 0.4), type: 'Culture', description: `Visit the top tourist spot in ${capitalDest}` },
        ],
        hotel: { name: `${capitalDest} Premier Hotel`, pricePerNight: dailyHotel },
        transport: { from: 'Airport', to: capitalDest, mode: 'Taxi', cost: Math.floor(transport * 0.5) },
      },
      {
        city: `${capitalDest} Surroundings`,
        days: 2,
        activities: [
          { name: 'Scenic Nature Trail', time: '07:00', duration: '3 hours', cost: 0, type: 'Nature', description: `Explore the natural beauty surrounding ${capitalDest}` },
          { name: 'Local Market Visit', time: '11:00', duration: '2 hours', cost: Math.floor(activitiesTotal * 0.3), type: 'Shopping', description: 'Browse local crafts, spices, and authentic souvenirs' },
        ],
        hotel: { name: `${capitalDest} Countryside Resort`, pricePerNight: dailyHotel },
        transport: { from: capitalDest, to: `${capitalDest} Surroundings`, mode: 'Local Bus', cost: Math.floor(transport * 0.5) },
      },
    ];
    budgetBreakdown = { accommodation, transport, food, activities: activitiesTotal, misc };
    tips = [
      `Best time to visit ${capitalDest}: October to March`,
      `Book accommodations in ${capitalDest} in advance during peak season`,
      'Carry light layers and comfortable footwear for sightseeing',
    ];
  }

  const mocks = {
    trip_generator: {
      tripName: `AI Generated Trip to ${capitalDest}`,
      totalBudget: budget,
      duration: `${tripStops.reduce((s, st) => s + st.days, 0)} days`,
      stops: tripStops,
      budgetBreakdown,
      tips,
    },
    mood_planner: {
      tripName: 'Relaxation Retreat',
      mood: 'relax',
      stops: [{ city: 'Bali', days: 5, activities: [{ name: 'Beach Yoga', time: '07:00', duration: '1 hour', cost: 20, type: 'Wellness' }] }],
      budgetBreakdown: { accommodation: 3000, transport: 500, food: 1000, activities: 800, misc: 200 },
      tips: ['Go with the flow — no strict schedules'],
    },
    budget_optimizer: {
      savings: [
        { category: 'Accommodation', currentCost: Math.floor(budget * 0.40), suggestedCost: Math.floor(budget * 0.30), suggestion: 'Switch to guesthouses or dharamshalas near temples for significant savings', saving: Math.floor(budget * 0.10) },
        { category: 'Transport', currentCost: Math.floor(budget * 0.15), suggestedCost: Math.floor(budget * 0.08), suggestion: 'Use local buses and shared autos instead of private taxis', saving: Math.floor(budget * 0.07) },
        { category: 'Food', currentCost: Math.floor(budget * 0.25), suggestedCost: Math.floor(budget * 0.18), suggestion: 'Eat at local dhabas and temple prasadam stalls rather than hotel restaurants', saving: Math.floor(budget * 0.07) },
      ],
      totalPotentialSaving: Math.floor(budget * 0.24),
      newTotal: Math.floor(budget * 0.76),
    },
    smart_packing: {
      categories: [
        { name: 'Documents', items: [{ name: 'Aadhaar / ID Proof', essential: true, reason: 'Required for temple special darshan tickets' }, { name: 'Travel Insurance', essential: true }, { name: 'Hotel Booking Confirmation', essential: true }] },
        { name: 'Clothing', items: [{ name: 'Traditional attire (dhoti/saree)', essential: true, reason: 'Mandatory for Tirumala temple entry' }, { name: 'Light cotton shirts (x3)', essential: true }, { name: 'Comfortable walking shoes', essential: true }, { name: 'Cap / Sun hat', essential: false, reason: 'Hills can be sunny' }] },
        { name: 'Electronics', items: [{ name: 'Phone + charger + power bank', essential: true }, { name: 'Camera', essential: false }] },
        { name: 'Toiletries', items: [{ name: 'Sunscreen SPF 50', essential: true }, { name: 'Hand sanitizer', essential: true }, { name: 'Insect repellent', essential: false }] },
        { name: 'Misc', items: [{ name: 'Water bottle', essential: true }, { name: 'Snacks for journey', essential: false }, { name: 'Small backpack for day trips', essential: true }] },
      ],
    },
    conflict_detection: {
      conflicts: [
        { type: 'temple_timing', description: 'Tirumala temple opens at 3:00 AM — if you plan darshan + sightseeing the same day, allocate at least 6 hours total', severity: 'high', suggestion: 'Split temple visit and sightseeing across two days' },
        { type: 'booking_required', description: 'Special darshan tickets need advance online booking — walk-in may take 8-12 hours of queue', severity: 'high', suggestion: 'Book tickets at tirupatibalaji.ap.gov.in 2 weeks in advance' },
      ],
    },
    weather_reschedule: {
      recommendations: [
        { day: 2, issue: 'Afternoon thunderstorms likely in hill region', affectedActivities: ['Silathoranam Rock Trek', 'Akasaganga Waterfall Visit'], suggestion: 'Complete outdoor activities before noon; visit temple or indoor spots in the afternoon', autoReschedule: true },
      ],
    },
    journal_generator: {
      title: `My Spiritual Journey to ${capitalDest}`,
      story: `The journey to ${capitalDest} began long before I arrived — in quiet prayers and a heart full of hope. As the train pulled into the station, the air itself seemed to carry a sacred hum. The hills of Tirumala loomed in the distance, shrouded in morning mist, their ancient forests whispering centuries of devotion...`,
      dayHighlights: [
        { day: 1, headline: `First Glimpse of ${capitalDest}`, body: 'Arrived to find the city buzzing with pilgrims from every corner of the country. The energy was electric yet peaceful.' },
        { day: 2, headline: 'Darshan at Tirumala', body: 'Standing before Lord Venkateswara, time seemed to stop. The gold-covered shrine, the chants, the flower offerings — an experience impossible to put into words.' },
      ],
      coverCaption: `A journey of faith through the sacred hills of ${capitalDest}`,
    },
    consensus_planner: {
      itinerary: [{ day: 1, activities: [{ name: 'Group Temple Visit', time: '05:00', votes: 4 }] }],
      compromises: [{ conflict: 'Some want quick darshan, others want full rituals', resolution: 'Book VIP 300 darshan — 2-hour wait with proper viewing time' }],
    },
    emergency_phrases: {
      phrases: (userMessage || '').toLowerCase().includes('japan') ? [
        { english: 'Help me', translation: 'Tasukete', phonetic: 'Ta-su-ke-te', script: '助けて' },
        { english: 'I need a doctor', translation: 'Isha ga hitsuyō desu', phonetic: 'I-sha ga hi-tsu-yō de-su', script: '医者が必要です' },
        { english: 'Call police', translation: 'Keisatsu o yonde kudasai', phonetic: 'Kei-sa-tsu o yon-de ku-da-sai', script: '警察を呼んでください' },
      ] : [
        { english: 'Help me', translation: 'Madad karo', phonetic: 'Ma-dad ka-ro', script: 'मदद करो' },
        { english: 'I need a doctor', translation: 'Mujhe doctor chahiye', phonetic: 'Muj-he doc-tor cha-hi-ye', script: 'मुझे डॉक्टर चाहिए' },
        { english: 'Call police', translation: 'Police ko bulao', phonetic: 'Po-lees ko bu-la-o', script: 'पुलिस को बुलाओ' },
      ],
    },
    suggest_activities: (() => {
      // Destination-specific curated activity lists with individual images
      const t = (rawDestination || '').toLowerCase();

      if (t.includes('tirupati') || t.includes('tirumala')) {
        return [
          { name: 'Tirumala Venkateswara Temple', cost: 0, type: 'Spiritual', duration: '4–6 hours',
            description: 'One of the most visited pilgrimage sites in the world. The Dravidian-style temple atop Tirumala hill is home to Lord Venkateswara and draws over 50,000 devotees daily.',
            highlights: ['Pre-book Special Entry darshan online', 'Temple opens at 3:00 AM', 'Receive sacred Tirupati Laddu prasadam', 'Stunning gold-plated Gopuram'],
            bestFor: 'Pilgrims & cultural tourists', minAge: 0, includes: 'Free entry (special darshan ~₹300)',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
          { name: 'Sri Padmavathi Ammavari Temple', cost: 0, type: 'Spiritual', duration: '2 hours',
            description: 'Ancient temple dedicated to Goddess Padmavathi, consort of Lord Venkateswara, located in Tiruchanur village 5 km from Tirupati.',
            highlights: ['Beautiful idol decorated with gold jewellery', 'Special Fridays attract huge crowds', 'Free prasadam offered', 'Peaceful temple complex'],
            bestFor: 'Devotees & history lovers', minAge: 0, includes: 'Free entry',
            image: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e38?w=800&q=80' },
          { name: 'Akasaganga Teertham Waterfall', cost: 0, type: 'Nature', duration: '1.5 hours',
            description: 'A sacred waterfall on the Tirumala hills mentioned in ancient scriptures. Pilgrims believe a holy dip purifies the soul before temple darshan.',
            highlights: ['Scenic forest trail', 'Sacred pilgrimage spot', 'Cool mist in all seasons', 'Photography paradise'],
            bestFor: 'Nature lovers & pilgrims', minAge: 0, includes: 'Free',
            image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80' },
          { name: 'Silathoranam Rock Formation', cost: 0, type: 'Nature', duration: '1 hour',
            description: 'A naturally formed rock arch on the Tirumala hills — a rare geological wonder. Only two such formations exist in the world, the other being in the USA.',
            highlights: ['Unique geological formation', '1-metre-wide natural arch', 'Ancient inscriptions nearby', 'Easy accessible walk'],
            bestFor: 'Nature enthusiasts & explorers', minAge: 5, includes: 'Free',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
          { name: 'ISKCON Tirupati Temple', cost: 0, type: 'Spiritual', duration: '1.5 hours',
            description: 'A beautiful Hare Krishna temple with stunning white marble architecture. Hosts elaborate evening aarti with music, flower offerings, and spiritual discourses.',
            highlights: ['Elaborate evening aarti (6:00 PM)', 'Marble architecture', 'Free prasadam', 'Spiritual bookshop'],
            bestFor: 'Families & spiritual seekers', minAge: 0, includes: 'Free',
            image: 'https://images.unsplash.com/photo-1526711657229-e7e080ed7aa1?w=800&q=80' },
          { name: 'Tirupati Local Food Trail', cost: 15, type: 'Food & Culture', duration: '2 hours',
            description: 'Taste Tirupati Dosa, Pulihora, Pongal, and the world-famous Tirupati Laddu from the best local establishments near the temple complex.',
            highlights: ['Famous Tirupati Laddu prasadam', 'Authentic Andhra meals', 'Street dosa stalls', 'Local filter coffee experience'],
            bestFor: 'Foodies & first-time visitors', minAge: 0, includes: 'Tastings (self-pay)',
            image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80' },
        ];
      }

      if (t.includes('kerala') || t.includes('kochi') || t.includes('alleppey')) {
        return [
          { name: 'Alleppey Houseboat Backwater Cruise', cost: 80, type: 'Nature', duration: '6–8 hours',
            description: 'Drift through emerald canals and paddy fields on a traditional kettuvallam houseboat. Watch village life unfold along the waterways of God\'s Own Country.',
            highlights: ['Traditional wooden houseboat', 'Gourmet Kerala meals onboard', 'Bird watching', 'Sunset views'],
            bestFor: 'Couples & families', minAge: 0, includes: 'Boat, meals, guide',
            image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80' },
          { name: 'Fort Kochi Heritage Walk', cost: 0, type: 'Culture', duration: '2.5 hours',
            description: 'Walk through colonial-era streets lined with Dutch, Portuguese, and British architecture. See Chinese fishing nets, St. Francis Church, and the Jewish Quarter.',
            highlights: ['Chinese fishing nets', 'St. Francis Church', '500-year-old Mattancherry Palace', 'Jewish Synagogue'],
            bestFor: 'History buffs & walkers', minAge: 0, includes: 'Free (guide: ~$10)',
            image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80' },
          { name: 'Kerala Kathakali Performance', cost: 25, type: 'Culture', duration: '2 hours',
            description: 'Watch Kerala\'s iconic classical dance-drama performed by masters in elaborate makeup and costumes. A UNESCO-recognized art form over 500 years old.',
            highlights: ['Traditional makeup demo', 'Expert performers', 'Storytelling through mudras', 'Post-show interaction'],
            bestFor: 'Culture lovers', minAge: 5, includes: 'Show ticket, makeup demo',
            image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80' },
          { name: 'Munnar Tea Plantation Trek', cost: 30, type: 'Nature', duration: '3 hours',
            description: 'Walk through endless rolling tea gardens in the Munnar highlands at 1600m altitude. Visit a working tea factory and taste fresh-picked Nilgiri tea.',
            highlights: ['Rolling tea garden views', 'Tea factory visit', 'Tea tasting session', 'Cool hill climate'],
            bestFor: 'Nature lovers & hikers', minAge: 8, includes: 'Guide, tea tasting',
            image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80' },
          { name: 'Ayurvedic Spa Retreat', cost: 60, type: 'Wellness', duration: 'Half day',
            description: 'Experience authentic Kerala Ayurvedic treatments including Abhyanga oil massage, Shirodhara, and herbal steam bath at a traditional wellness centre.',
            highlights: ['Traditional Abhyanga massage', 'Shirodhara treatment', 'Herbal steam bath', 'Certified practitioners'],
            bestFor: 'Wellness seekers', minAge: 16, includes: 'All treatments, herbal tea',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
          { name: 'Marari Beach Sunrise Walk', cost: 0, type: 'Nature', duration: '2 hours',
            description: 'Stroll along one of Kerala\'s least crowded, pristine beaches at sunrise. Watch local fishermen cast nets and collect the morning catch.',
            highlights: ['Unspoiled coastline', 'Fishing village culture', 'Sunrise photography', 'Sea turtle nesting site'],
            bestFor: 'Peaceful travelers & photographers', minAge: 0, includes: 'Free',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
        ];
      }

      if (t.includes('goa')) {
        return [
          { name: 'Dudhsagar Waterfall Jeep Safari', cost: 35, type: 'Adventure', duration: '5 hours',
            description: 'Jeep safari through dense Bhagwan Mahavir Wildlife Sanctuary to reach one of India\'s tallest waterfalls (310m). Swim in the natural pool at the base.',
            highlights: ['4WD jungle safari', 'Swim at waterfall base', 'Wildlife spotting', 'Picnic lunch stop'],
            bestFor: 'Adventure seekers', minAge: 8, includes: 'Jeep, guide, forest entry fee',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' },
          { name: 'Old Goa Church Walking Tour', cost: 10, type: 'Culture', duration: '2 hours',
            description: 'Explore UNESCO World Heritage Portuguese churches including Basilica of Bom Jesus and Se Cathedral — architectural gems over 400 years old.',
            highlights: ['UNESCO Heritage sites', 'St. Francis Xavier relics', '400-year-old architecture', 'Expert guide'],
            bestFor: 'History & architecture lovers', minAge: 0, includes: 'Guide, entry fees',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
          { name: 'Palolem Beach Kayaking', cost: 20, type: 'Adventure', duration: '2 hours',
            description: 'Kayak through crystal-clear waters of Palolem\'s crescent bay. Spot dolphins in the early morning and explore sea caves along the coastline.',
            highlights: ['Dolphin spotting', 'Sea cave exploration', 'Crystal clear water', 'Beginner-friendly'],
            bestFor: 'Water sports lovers', minAge: 10, includes: 'Kayak, life jacket, guide',
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' },
          { name: 'Spice Plantation Tour', cost: 20, type: 'Culture', duration: '3 hours',
            description: 'Walk through a working spice plantation and learn about growing cardamom, vanilla, nutmeg, and pepper. Traditional Goan lunch served on banana leaf.',
            highlights: ['Live spice growing tour', 'Elephant interaction', 'Traditional Goan lunch', 'Spice shopping at farm prices'],
            bestFor: 'Families & foodies', minAge: 0, includes: 'Tour, lunch, spice samples',
            image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80' },
          { name: 'Baga Beach Water Sports', cost: 50, type: 'Adventure', duration: '3 hours',
            description: 'Try parasailing, jet skiing, banana boat rides, and bumper boats at Baga — Goa\'s most vibrant beach with the best water sports infrastructure.',
            highlights: ['Parasailing over sea', 'Jet ski rides', 'Banana boat', 'Lifeguard supervised'],
            bestFor: 'Thrill seekers & groups', minAge: 12, includes: 'Equipment, instructor',
            image: 'https://images.unsplash.com/photo-1510149900760-f9c37eed1b1a?w=800&q=80' },
          { name: 'Anjuna Flea Market', cost: 0, type: 'Shopping', duration: '2 hours',
            description: 'Browse one of India\'s most famous flea markets for boho jewellery, vintage clothing, local handicrafts, and organic products every Wednesday.',
            highlights: ['Unique boho jewellery', 'Local handicrafts', 'Live music performances', 'Street food stalls'],
            bestFor: 'Shoppers & culture seekers', minAge: 0, includes: 'Free entry',
            image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80' },
        ];
      }

      if (t.includes('coimbatore') || t.includes('kovai')) {
        return [
          { name: 'Marudamalai Murugan Temple', location: 'Marudhamalai Hills, Coimbatore', cost: 0, type: 'Spiritual', duration: '2 hours',
            description: 'Ancient hilltop temple dedicated to Lord Murugan perched on the Nilgiri foothills. Offers sweeping panoramic views of Coimbatore city and is one of the most revered pilgrimage sites in Tamil Nadu.',
            highlights: ['Hilltop panoramic city views', 'Ancient Dravidian gopuram', 'Temple elephant', 'Spectacular dawn aarti'],
            bestFor: 'Pilgrims & culture lovers', minAge: 0, includes: 'Free entry',
            image: 'https://images.unsplash.com/photo-1561361058-c24e01238a46?w=800&q=80' },
          { name: 'Gedee Car Museum', location: 'Sathy Road, Race Course, Coimbatore', cost: 5, type: 'Culture', duration: '2 hours',
            description: "India's finest private automotive museum with 200+ vintage cars, motorcycles, steam engines, and WWII aircraft. Founded by the Gedee family — a must-visit for history enthusiasts.",
            highlights: ['200+ vintage vehicles', 'WWII-era Spitfire aircraft', 'Rare 1900s Rolls Royce', 'Well-preserved exhibits'],
            bestFor: 'Families & history buffs', minAge: 0, includes: 'Entry ticket (~₹50)',
            image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80' },
          { name: 'Perur Pateeswarar Temple', location: 'Perur Village, 6 km from Coimbatore', cost: 0, type: 'Spiritual', duration: '1.5 hours',
            description: 'Over 2000-year-old Shiva temple on the banks of River Noyyal with stunning Dravidian architecture, intricate carvings of devas and apsaras, and a sacred tank mentioned in Sangam literature.',
            highlights: ['2000-year-old heritage', 'Intricate Dravidian carvings', 'Sacred Noyyal riverbank', 'Famous Karthigai festival'],
            bestFor: 'History buffs & devotees', minAge: 0, includes: 'Free',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
          { name: 'VOC Park & Zoo', location: 'Racecourse Road, Coimbatore', cost: 3, type: 'Nature', duration: '3 hours',
            description: "Coimbatore's largest urban zoo housing 100+ animal species including lions, Bengal tigers, rare white tigers, crocodiles, and exotic birds. A great family outing in the heart of the city.",
            highlights: ['Rare white tiger', 'Toy train rides', 'Boating lake', '100+ animal species'],
            bestFor: 'Families with children', minAge: 0, includes: 'Entry (~₹30), toy train separate',
            image: 'https://images.unsplash.com/photo-1503256207526-0d5523f39793?w=800&q=80' },
          { name: 'Coimbatore Food Trail (Parotta & Filter Coffee)', location: 'Gandhipuram & RS Puram, Coimbatore', cost: 10, type: 'Food & Drink', duration: '2 hours',
            description: "Explore Coimbatore's iconic food culture — crispy Parotta with Salna gravy, Kothu Parotta, Annapoorna's legendary meals, and thick South Indian filter coffee at authentic local eateries.",
            highlights: ['Annapoorna restaurant (since 1970)', 'Famous Parotta Salna', 'Late-night Kothu Parotta stalls', 'Authentic filter coffee decoction'],
            bestFor: 'Foodies', minAge: 0, includes: 'Self-pay (budget ~₹300)',
            image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80' },
          { name: 'Dhyanalinga Yoga Temple & Isha Foundation', location: 'Velliangiri Foothills, 30 km from Coimbatore', cost: 0, type: 'Wellness', duration: '3 hours',
            description: "Sadhguru's world-renowned Isha Foundation eco-campus. The Dhyanalinga is a unique energized space for meditation that transcends religious boundaries, set amid lush forest.",
            highlights: ['Powerful meditative space', 'Lush 150-acre eco-campus', 'Theerthakund sacred pool', 'Yoga sessions available'],
            bestFor: 'Wellness seekers & spiritual travelers', minAge: 0, includes: 'Free (donations welcome)',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
          { name: 'Gass Forest Museum & Botanical Garden', location: 'Forest College Campus, Mettupalayam Road', cost: 2, type: 'Nature', duration: '2 hours',
            description: "One of India's oldest forest museums (est. 1902) showcasing rare timber specimens, wildlife taxidermy, and a lush botanical garden on the historic Forest College campus.",
            highlights: ['150-year-old museum', 'Rare timber specimens', 'Botanical garden walks', 'Wildlife & bird exhibits'],
            bestFor: 'Nature lovers & students', minAge: 0, includes: 'Entry fee (~₹20)',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
        ];
      }

      // Generic fallback — sensible activities with real images
      return [
        { name: `${capitalDest} Heritage Walk`, cost: 0, type: 'Culture', duration: '2.5 hours',
          description: `Explore the historic landmarks, monuments, and cultural highlights of ${capitalDest} with a knowledgeable local guide.`,
          highlights: ['Expert local guide', 'Key historical sites', 'Photography stops', 'Cultural stories'],
          bestFor: 'History lovers', minAge: 0, includes: 'Guide',
          image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80' },
        { name: `${capitalDest} Local Food Trail`, cost: 20, type: 'Food & Drink', duration: '2 hours',
          description: `Taste the iconic local dishes and street food that ${capitalDest} is famous for, guided by a passionate food enthusiast.`,
          highlights: ['8-10 food tastings', 'Hidden local stalls', 'Food culture stories', 'Vegetarian-friendly options'],
          bestFor: 'Foodies', minAge: 0, includes: 'All tastings, guide',
          image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80' },
        { name: 'Guided Museum Visit', cost: 15, type: 'Culture', duration: '3 hours',
          description: `Explore the top museum in ${capitalDest} with an audio guide or expert curator. Covers art, history, and local heritage.`,
          highlights: ['Skip-the-line entry', 'Audio guide available', 'Permanent & temporary exhibitions', 'Gift shop'],
          bestFor: 'Art & history buffs', minAge: 0, includes: 'Entry, audio guide',
          image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80' },
        { name: 'Scenic Nature Trek', cost: 10, type: 'Nature', duration: '3 hours',
          description: `Hike through the most scenic natural trails in and around ${capitalDest}, taking in landscapes, viewpoints, and local flora.`,
          highlights: ['Scenic viewpoints', 'Wildlife spotting', 'Sunrise/sunset options', 'Experienced trail guide'],
          bestFor: 'Active travelers', minAge: 10, includes: 'Guide, water',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
        { name: 'Local Market Experience', cost: 5, type: 'Shopping', duration: '2 hours',
          description: `Browse vibrant local bazaars and markets in ${capitalDest} for handicrafts, textiles, spices, and authentic souvenirs at bargain prices.`,
          highlights: ['Local handicrafts', 'Bargaining tips', 'Authentic souvenirs', 'Street snacks'],
          bestFor: 'Shoppers & culture seekers', minAge: 0, includes: 'Guide, market map',
          image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80' },
        { name: 'Photography & Sightseeing Tour', cost: 25, type: 'Culture', duration: '4 hours',
          description: `Visit the most photogenic spots in ${capitalDest} with a local photographer guide who knows the best angles and lighting times.`,
          highlights: ['Best shooting locations', 'Golden hour photography', 'Composition tips', 'Small group'],
          bestFor: 'Photography enthusiasts', minAge: 0, includes: 'Guide, location access',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764bed?w=800&q=80' },
      ];
    })(),
    activity_details: {
      title: extraContext?.title || 'Unknown Activity',
      city: extraContext?.destination || 'Unknown City',
      category: 'Culture',
      tagline: 'An immersive experience connecting you with local heritage.',
      about: 'This location is one of the premier cultural landmarks in the region, offering visitors a unique glimpse into the area’s rich history and vibrant traditions. Known for its meticulously preserved architecture and engaging exhibits, it has been recognized by national tourism boards as a must-visit destination. The site frequently hosts expert-led tours and special events throughout the year.',
      highlights: [
        'Guided tours by local experts',
        'Exclusive access to historical areas',
        'Interactive cultural exhibits',
        'Scenic viewpoints for photography'
      ],
      cost: '₹500 / $10',
      duration: '2–3 hours',
      min_age: 'All ages',
      best_for: 'Families, History buffs',
      includes: 'Entry ticket, guided audio tour, access to special exhibits',
      accommodation: {
        available: true,
        options: ['On-site heritage guest house', 'Nearby boutique hotels'],
        price_range: '$50 - $150 per night',
        booking_link: 'https://example.com/booking'
      },
      food: {
        available: true,
        options: ['Traditional cafe', 'Fine dining restaurant nearby'],
        details: 'Authentic local cuisine served from 8 AM to 10 PM. Vegan options available.'
      },
      facilities: ['Wheelchair accessible', 'Restrooms', 'Gift shop', 'Parking'],
      contact: {
        phone: '+91 98765 43210',
        email: 'info@example.com',
        website: 'https://example.com',
        address: '123 Main Street, Heritage District'
      },
      source: 'https://example.com/official'
    },
    community_feed: [
      {
        id: "mock-trip-1",
        user: { name: "Sarah Jenkins", avatar_initial: "S", avatar_color: "purple", location: "Seattle, USA", trips_count: 12, followers: 340 },
        trip: { title: "Backpacking the Swiss Alps", tagline: "7 days of pure mountain bliss and fondue.", destinations: ["Zurich", "Zermatt", "Lucerne"], days: 7, stops: 4, travel_style: "Adventure", month_year: "August 2024" },
        media: [{ type: "photo", caption: "The Matterhorn at sunrise 🏔️", location_tag: "Zermatt, Switzerland", placeholder_description: "A breathtaking view of the Matterhorn mountain at sunrise with pink skies." }],
        stats: { copies: 45, likes: 312, comments: 28, saves: 102 },
        highlights: ["Hiking the 5 Lakes Walk", "Glacier Express train ride", "Cheese fondue in a traditional chalet"],
        budget_per_person: "$1800", rating: 4.8, tags: ["Mountains", "Hiking", "Scenic"]
      }
    ],
    community_review: {
      sentiment: "positive",
      summary: "The user absolutely loved the trip, especially the local food recommendations and well-paced itinerary.",
      highlights_mentioned: ["Great food spots", "Pacing was perfect", "Hidden gems"],
      concerns_mentioned: ["Some days felt a bit too packed"],
      helpful_tags: ["Foodie approved", "Action-packed"],
      reply_suggestion: "So glad you enjoyed the local food spots! We'll definitely take the feedback on pacing into consideration for future itineraries.",
      display_review: { short_version: "Loved the food and hidden gems! Perfect pacing.", full_version: "This trip was incredible. The local food recommendations were spot on and I felt like we really got to see the hidden gems of the city. My only minor critique is that a couple of the days felt a bit too packed, but overall it was a fantastic experience." }
    },
    community_caption: {
      suggested_caption: "Lost in the vibrant streets of " + (extraContext?.destination || "this beautiful city") + " 🌆 Every corner tells a new story! Who's ready for an adventure?",
      hashtags: ["#Wanderlust", "#CityVibes", "#TravelDiaries", "#HiddenGems", "#ExploreMore"],
      location_tag_suggestion: "Old Town District",
      mood: "Adventurous",
      alt_captions: ["Soaking up the local culture today ✨", "Can't get enough of these views! 📸"]
    },
    community_trending: [
      { rank: 1, city: "Kyoto", country: "Japan", trend_reason: "Cherry blossom season is approaching, making it a top bucket-list destination right now.", avg_trip_cost: "$1500", best_month: "April", travel_style: "Cultural", community_posts: 1240, trending_activity: "Philosopher's Path Walk" },
      { rank: 2, city: "Amalfi Coast", country: "Italy", trend_reason: "Travelers are booking early for summer Mediterranean getaways.", avg_trip_cost: "$2200", best_month: "June", travel_style: "Luxury", community_posts: 890, trending_activity: "Boat tour to Capri" },
      { rank: 3, city: "Banff", country: "Canada", trend_reason: "Late winter ski trips and Northern Lights chasing are peaking.", avg_trip_cost: "$1100", best_month: "March", travel_style: "Adventure", community_posts: 650, trending_activity: "Lake Louise Ice Skating" },
      { rank: 4, city: "Oaxaca", country: "Mexico", trend_reason: "Culinary tourism is exploding here for authentic mezcal and mole.", avg_trip_cost: "$800", best_month: "November", travel_style: "Foodie", community_posts: 510, trending_activity: "Mezcal Tasting Tour" },
      { rank: 5, city: "Chiang Mai", country: "Thailand", trend_reason: "Digital nomads are flocking here for the perfect balance of budget and culture.", avg_trip_cost: "$600", best_month: "January", travel_style: "Budget", community_posts: 1500, trending_activity: "Elephant Nature Park" },
      { rank: 6, city: "Reykjavik", country: "Iceland", trend_reason: "Last chance to easily catch the Aurora Borealis before summer.", avg_trip_cost: "$1800", best_month: "March", travel_style: "Nature", community_posts: 720, trending_activity: "Golden Circle Tour" },
      { rank: 7, city: "Marrakech", country: "Morocco", trend_reason: "Perfect spring weather before the intense summer heat sets in.", avg_trip_cost: "$900", best_month: "April", travel_style: "Cultural", community_posts: 480, trending_activity: "Medina Souk Shopping" },
      { rank: 8, city: "Sedona", country: "USA", trend_reason: "Wellness retreats and red rock hiking are highly sought after right now.", avg_trip_cost: "$1300", best_month: "May", travel_style: "Wellness", community_posts: 390, trending_activity: "Vortex Hiking" }
    ],
    community_inspiration: [
      { trip_id: "insp-1", match_score: 95, reason: "Since you love Adventure and Budget travel, this rugged backpacking route perfectly matches your style.", highlight_for_user: "The overnight volcano hike will be right up your alley!" },
      { trip_id: "insp-2", match_score: 88, reason: "You mentioned an interest in food and culture; this itinerary focuses heavily on street food tours and local markets.", highlight_for_user: "The hidden night market food tour is rated 5 stars by other foodies." },
      { trip_id: "insp-3", match_score: 82, reason: "A slightly more relaxed pace for those days you want to unwind, but still packed with authentic local experiences.", highlight_for_user: "A half-day traditional cooking class where you eat what you make." }
    ],
    packing_core: {
      trip_summary: "A tailored packing list designed perfectly for your upcoming adventure.",
      weather_note: "Expect sunny days but cooler evenings; layering is key.",
      categories: [
        {
          id: "cat-1", name: "Documents", icon: "🛂", priority: "Essential",
          items: [
            { id: "item-1-1", name: "Passport", quantity: "1", why: "Required for international travel.", priority: "Must-have", packed: false },
            { id: "item-1-2", name: "Travel Insurance", quantity: "1", why: "Essential safety net.", priority: "Must-have", packed: false },
            { id: "item-1-3", name: "Flight Tickets", quantity: "2", why: "For departure and return.", priority: "Must-have", packed: false },
            { id: "item-1-4", name: "Hotel Reservations", quantity: "1", why: "For check-in.", priority: "Must-have", packed: false },
            { id: "item-1-5", name: "Emergency Contacts", quantity: "1", why: "Just in case.", priority: "Must-have", packed: false }
          ]
        },
        {
          id: "cat-2", name: "Clothing", icon: "👕", priority: "Essential",
          items: [
            { id: "item-2-1", name: "T-shirts", quantity: "5", why: "Daily wear.", priority: "Must-have", packed: false },
            { id: "item-2-2", name: "Shorts", quantity: "2", why: "For daytime heat.", priority: "Must-have", packed: false },
            { id: "item-2-3", name: "Light Jacket", quantity: "1", why: "For cooler evenings.", priority: "Must-have", packed: false },
            { id: "item-2-4", name: "Swimwear", quantity: "1", why: "For the beach or pool.", priority: "Must-have", packed: false },
            { id: "item-2-5", name: "Comfortable Shoes", quantity: "1 pair", why: "For long walks.", priority: "Must-have", packed: false }
          ]
        },
        {
          id: "cat-3", name: "Toiletries", icon: "🪥", priority: "Essential",
          items: [
            { id: "item-3-1", name: "Toothbrush", quantity: "1", why: "Daily hygiene.", priority: "Must-have", packed: false },
            { id: "item-3-2", name: "Toothpaste", quantity: "1", why: "Daily hygiene.", priority: "Must-have", packed: false },
            { id: "item-3-3", name: "Sunscreen", quantity: "1", why: "Protect against UV rays.", priority: "Must-have", packed: false },
            { id: "item-3-4", name: "Deodorant", quantity: "1", why: "Stay fresh.", priority: "Must-have", packed: false },
            { id: "item-3-5", name: "Shampoo", quantity: "1", why: "Hair care.", priority: "Recommended", packed: false }
          ]
        },
        {
          id: "cat-4", name: "Electronics", icon: "📱", priority: "Essential",
          items: [
            { id: "item-4-1", name: "Smartphone", quantity: "1", why: "Communication and navigation.", priority: "Must-have", packed: false },
            { id: "item-4-2", name: "Charger", quantity: "1", why: "Keep devices powered.", priority: "Must-have", packed: false },
            { id: "item-4-3", name: "Power Bank", quantity: "1", why: "For long days out.", priority: "Recommended", packed: false },
            { id: "item-4-4", name: "Universal Adapter", quantity: "1", why: "For international outlets.", priority: "Recommended", packed: false },
            { id: "item-4-5", name: "Headphones", quantity: "1", why: "For the flight.", priority: "Recommended", packed: false }
          ]
        },
        {
          id: "cat-5", name: "Health & Safety", icon: "💊", priority: "Recommended",
          items: [
            { id: "item-5-1", name: "First Aid Kit", quantity: "1", why: "For minor emergencies.", priority: "Recommended", packed: false },
            { id: "item-5-2", name: "Pain Relievers", quantity: "10 pills", why: "For headaches or aches.", priority: "Recommended", packed: false },
            { id: "item-5-3", name: "Band-Aids", quantity: "5", why: "For blisters.", priority: "Recommended", packed: false },
            { id: "item-5-4", name: "Hand Sanitizer", quantity: "1", why: "For hygiene on the go.", priority: "Must-have", packed: false },
            { id: "item-5-5", name: "Prescription Meds", quantity: "As needed", why: "Personal health requirements.", priority: "Must-have", packed: false }
          ]
        },
        {
          id: "cat-6", name: "Miscellaneous", icon: "🎒", priority: "Optional",
          items: [
            { id: "item-6-1", name: "Sunglasses", quantity: "1", why: "Eye protection.", priority: "Recommended", packed: false },
            { id: "item-6-2", name: "Water Bottle", quantity: "1", why: "Stay hydrated.", priority: "Recommended", packed: false },
            { id: "item-6-3", name: "Travel Pillow", quantity: "1", why: "For the flight.", priority: "Nice-to-have", packed: false },
            { id: "item-6-4", name: "Book/Kindle", quantity: "1", why: "Entertainment.", priority: "Nice-to-have", packed: false },
            { id: "item-6-5", name: "Snacks", quantity: "3", why: "For between meals.", priority: "Nice-to-have", packed: false }
          ]
        }
      ],
      pro_tips: ["Roll your clothes instead of folding to save space.", "Put heavy items at the bottom of your suitcase.", "Use packing cubes to stay organized."],
      weight_warning: "Looks like you have a lot of electronics! Consider bringing a multi-port charger to save space and weight.",
      dont_forget: ["A reusable tote bag for shopping or beach days!"]
    },
    packing_gamify: {
      progress_message: "You're doing great! Keep up the momentum.",
      current_badge: { name: "Half-way Hero", emoji: "🏅", unlocked: true },
      next_badge: { name: "Checklist Champion", emoji: "🏆", items_remaining: 5 },
      urgency_message: "Your trip is coming up soon! Time to pack the essentials.",
      packing_tip_of_day: "Remember to pack your chargers in your carry-on.",
      challenge: { title: "Pack your toiletries in the next 10 mins!", reward: "Speed Packer Badge" }
    },
    packing_addons: [
      { name: "Packing Cubes", category: "Organization", why: "Keeps everything separated and saves space.", buy_link_search: "packing cubes travel", estimated_cost: "$15-$25", surprise_factor: "Smart" },
      { name: "Travel Door Alarm", category: "Safety", why: "Extra peace of mind in unfamiliar accommodations.", buy_link_search: "travel door alarm", estimated_cost: "$10-$15", surprise_factor: "Unexpected" },
      { name: "Portable Luggage Scale", category: "Utility", why: "Avoid unexpected overweight baggage fees on your return flight.", buy_link_search: "portable luggage scale", estimated_cost: "$10", surprise_factor: "Life-saver" },
      { name: "Solid Shampoo Bar", category: "Toiletries", why: "No liquid restrictions and won't leak in your bag.", buy_link_search: "solid shampoo bar", estimated_cost: "$8-$12", surprise_factor: "Smart" },
      { name: "Universal Travel Adapter with USB-C", category: "Electronics", why: "One plug to charge your phone, laptop, and accessories globally.", buy_link_search: "universal travel adapter gan", estimated_cost: "$20-$30", surprise_factor: "Obvious" },
      { name: "Collapsible Water Bottle", category: "Miscellaneous", why: "Stays completely flat when empty, perfect for day bags.", buy_link_search: "collapsible water bottle", estimated_cost: "$12", surprise_factor: "Unexpected" }
    ],
    packing_share: {
      share_title: "My Ultimate Packing List!",
      share_description: "Check out what I'm bringing on my next adventure. I'm almost fully packed and ready to go!",
      readiness_score: 85,
      readiness_label: "Almost Ready!",
      packed_summary: "15/20 items packed across 6 categories",
      missing_essentials: ["Passport", "Charger"],
      hashtags: ["#TravelPrep", "#PackingList", "#Wanderlust"],
      share_text: "Getting ready for my trip! ✈️ 85% packed. Just need to grab my Passport and Charger and I'm good to go! Check out my packing list on Traveloop. #TravelPrep #PackingList"
    },
    chatbot: {
      reply: (() => {
        const greetings = [
          "Hi! I'm Groq, your AI travel assistant. How can I help you plan your next adventure?",
          "Hey there! Need help with trip planning, budget optimization, or travel tips? Ask away!",
          "Welcome to Traveloop! I can help you generate trips, find activities, pack smart, and much more. What would you like to know?",
          "Hello! I'm here to help with all things travel. Whether it's finding the perfect destination or planning your itinerary, I'm at your service.",
          "Looking for travel inspiration? I can suggest destinations, create itineraries, help with budgeting, or answer any travel questions!"
        ];
        
        const userMessageLower = (userMessage || '').toLowerCase();
        
        if (userMessageLower.includes('hello') || userMessageLower.includes('hi')) {
          return greetings[Math.floor(Math.random() * greetings.length)];
        } else if (userMessageLower.includes('paris')) {
          return "Paris, the City of Light! 🗼 Perfect for romance, art, and world-class cuisine. Would you like me to create a full itinerary for Paris? I can suggest must-visit landmarks, hidden gems, and authentic local experiences.";
        } else if (userMessageLower.includes('budget')) {
          return "I can definitely help with budgeting! Tell me your total budget, trip duration, and preferred destinations. I'll break it down across accommodation, transport, food, activities, and miscellaneous expenses. Plus, I can suggest ways to optimize your spending!";
        } else if (userMessageLower.includes('packing')) {
          return "Smart packing is key to a great trip! Tell me where you're going and how long you'll be there, and I'll create a personalized packing list. I'll also suggest smart add-ons you might not have thought of.";
        } else if (userMessageLower.includes('weather') || userMessageLower.includes('best time')) {
          return "Great question! The best time to travel depends on your destination. Generally: India (Oct-Mar), Europe (May-Sep), Southeast Asia (Nov-Feb). Tell me where you want to go and I'll give you specific recommendations for weather, crowds, and seasonal highlights!";
        } else if (userMessageLower.includes('help')) {
          return "I can help with: ✈️ Trip generation and planning, 🗺️ Destination suggestions, 💰 Budget optimization, 🎒 Smart packing lists, 🍽️ Food recommendations, 🎯 Activity suggestions, and 💬 Travel tips. What would you like help with?";
        } else {
          const responses = [
            "That sounds interesting! Can you give me a bit more detail? For example: Which destination are you thinking of? How long do you want to travel? What's your budget?",
            "I'd love to help! To give you the best suggestions, could you tell me: (1) Where you want to go, (2) How many days, and (3) Your budget?",
            "Great! I can definitely assist. Let me know more about your travel plans — where, when, and how much you want to spend. Then I can create the perfect itinerary for you!",
            "Sounds good! To personalize my recommendations, share your destination preferences, trip length, and budget. That way I can suggest the best activities and planning strategy for you."
          ];
          return responses[Math.floor(Math.random() * responses.length)];
        }
      })()
    }
  };

  return mocks[feature] || { message: 'AI feature placeholder – configure GROQ_API_KEY for real generation', feature };
}

module.exports = { getMockResponse };
