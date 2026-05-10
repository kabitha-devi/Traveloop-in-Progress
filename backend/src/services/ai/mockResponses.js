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
};

// ─── Destination Lookup ───
function matchDestination(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('tirupati') || t.includes('tirumala') || t.includes('venkateswara')) return DESTINATIONS.tirupati;
  if (t.includes('kerala') || t.includes('kochi') || t.includes('alleppey') || t.includes('munnar')) return DESTINATIONS.kerala;
  if (t.includes('goa') || t.includes('palolem') || t.includes('baga') || t.includes('calangute')) return DESTINATIONS.goa;
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
    suggest_activities: destData ? destData.stops.flatMap(stop =>
      stop.activities.map(a => ({
        name: a.name,
        cost: a.cost === null ? Math.floor(budget * 0.05) : a.cost,
        type: a.type,
        description: a.description,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      }))
    ).slice(0, 6) : [],
  };

  return mocks[feature] || { message: 'AI feature placeholder – configure GEMINI_API_KEY for real generation', feature };
}

module.exports = { getMockResponse };
