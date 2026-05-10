// mockResponses.js – provides deterministic mock data for AI services when Claude API key is absent.

function getMockResponse(feature, userMessage) {
  let destination = "Kochi";
  let budget = 15000;
  if (userMessage) {
    const match = userMessage.match(/trip:\s*"([^"]+)"/i);
    if (match && match[1]) {
      destination = match[1].replace(/.*trip to\s+/i, '').trim();
      destination = destination.charAt(0).toUpperCase() + destination.slice(1);
    }
    const matchBudget = userMessage.match(/Budget: \$(\d+)/i);
    if (matchBudget && matchBudget[1]) {
      budget = parseInt(matchBudget[1], 10);
    }
  }

  const accommodation = Math.floor(budget * 0.4);
  const transport = Math.floor(budget * 0.15);
  const food = Math.floor(budget * 0.25);
  const activitiesTotal = Math.floor(budget * 0.15);
  const misc = budget - accommodation - transport - food - activitiesTotal;
  
  const dailyHotel = Math.floor(accommodation / 5);
  const actCost1 = Math.floor(activitiesTotal * 0.6);
  const actCost2 = Math.floor(activitiesTotal * 0.4);
  const trans1 = Math.floor(transport * 0.4);
  const trans2 = Math.floor(transport * 0.6);

  const mocks = {
    trip_generator: {
      tripName: `AI Generated Trip to ${destination}`,
      totalBudget: budget,
      duration: "5 days",
      stops: [
        {
          city: destination,
          days: 2,
          activities: [
            { name: `Walking Tour of ${destination}`, time: "09:00", duration: "2 hours", cost: 0, type: "Culture", description: `Explore the rich history and main sights of ${destination}` },
            { name: "Local Cuisine Experience", time: "14:00", duration: "3 hours", cost: actCost1, type: "Food", description: "Taste the best local dishes" },
          ],
          hotel: { name: `Grand Hotel ${destination}`, pricePerNight: dailyHotel },
          transport: { from: "Airport", to: destination, mode: "taxi", cost: trans1 },
        },
        {
          city: `${destination} Outskirts`,
          days: 3,
          activities: [
            { name: "Nature Reserve Visit", time: "10:00", duration: "3 hours", cost: actCost2, type: "Nature", description: "Beautiful landscapes just outside the city" },
            { name: "Sunset Viewpoint Trek", time: "16:00", duration: "4 hours", cost: 0, type: "Adventure", description: "Trek to a scenic viewpoint" },
          ],
          hotel: { name: `${destination} Hillview Resort`, pricePerNight: dailyHotel },
          transport: { from: destination, to: `${destination} Outskirts`, mode: "road", cost: trans2 },
        },
      ],
      budgetBreakdown: { accommodation, transport, food, activities: activitiesTotal, misc },
      tips: ["Best time to visit: September-March", `Carry comfortable shoes for walking around ${destination}`, "Book local tours in advance"]
    },
    mood_planner: {
      tripName: "Relaxation Retreat",
      mood: "relax",
      stops: [{ city: "Bali", days: 5, activities: [{ name: "Beach Yoga", time: "07:00", duration: "1 hour", cost: 20, type: "Wellness" }] }],
      budgetBreakdown: { accommodation: 3000, transport: 500, food: 1000, activities: 800, misc: 200 },
      tips: ["Go with the flow — no strict schedules"]
    },
    budget_optimizer: {
      savings: [
        { category: "Accommodation", currentCost: 5000, suggestedCost: 3000, suggestion: "Switch to boutique guesthouses instead of 4-star hotels", saving: 2000 },
        { category: "Transport", currentCost: 3000, suggestedCost: 1500, suggestion: "Use local buses and trains instead of private taxis", saving: 1500 }
      ],
      totalPotentialSaving: 3500,
      newTotal: 11500
    },
    smart_packing: {
      categories: [
        { name: "Documents", items: [{ name: "Passport", essential: true }, { name: "Flight Tickets", essential: true }, { name: "Travel Insurance", essential: true, reason: "Medical coverage abroad" }] },
        { name: "Clothing", items: [{ name: "Light cotton shirts (x4)", essential: true, reason: "Tropical climate" }, { name: "Rain jacket", essential: true, reason: "Monsoon forecast" }, { name: "Comfortable walking shoes", essential: true }] },
        { name: "Electronics", items: [{ name: "Phone charger + power bank", essential: true }, { name: "Universal adapter", essential: true, reason: "Different plug types" }] },
        { name: "Toiletries", items: [{ name: "Sunscreen SPF 50", essential: true, reason: "High UV index" }, { name: "Insect repellent", essential: true }] }
      ]
    },
    conflict_detection: {
      conflicts: [
        { type: "schedule_overlap", description: "Museum visit ends at 14:00 but lunch reservation is at 13:30", severity: "medium", suggestion: "Shift lunch to 14:30", autoFix: { field: "startTime", newValue: "14:30" } },
        { type: "budget_exceeded", description: "Total activities cost exceeds budget by $200", severity: "low", suggestion: "Consider free walking tour instead of paid city tour" }
      ]
    },
    weather_reschedule: {
      recommendations: [
        { day: 2, issue: "Heavy rain forecasted", affectedActivities: ["Beach Visit", "Snorkeling"], suggestion: "Move beach activities to Day 4 (sunny), do museum visit on Day 2 instead", autoReschedule: true }
      ]
    },
    journal_generator: {
      title: "My Kerala Adventure 2026",
      story: "The moment I stepped off the plane in Kochi, the warm tropical air wrapped around me like a welcome embrace...",
      dayHighlights: [
        { day: 1, headline: "First Steps in Fort Kochi", body: "The colonial streets told stories of centuries past..." },
        { day: 2, headline: "Lost in the Backwaters", body: "Drifting through emerald waterways on a traditional houseboat..." }
      ],
      coverCaption: "A journey through God's Own Country"
    },
    consensus_planner: {
      itinerary: [{ day: 1, activities: [{ name: "Group Temple Visit", time: "09:00", votes: 4 }] }],
      compromises: [{ conflict: "Half want beach, half want trekking", resolution: "Morning trek, afternoon beach — best of both worlds" }]
    },
    emergency_phrases: {
      phrases: (userMessage || '').toLowerCase().includes('japan') ? [
        { english: "Help me", translation: "Tasukete", phonetic: "Ta-su-ke-te", script: "助けて" },
        { english: "I need a doctor", translation: "Isha ga hitsuyō desu", phonetic: "I-sha ga hi-tsu-yō de-su", script: "医者が必要です" },
        { english: "Call police", translation: "Keisatsu o yonde kudasai", phonetic: "Kei-sa-tsu o yon-de ku-da-sai", script: "警察を呼んでください" }
      ] : [
        { english: "Help me", translation: "Madad karo", phonetic: "Ma-dad ka-ro", script: "मदद करो" },
        { english: "I need a doctor", translation: "Mujhe doctor chahiye", phonetic: "Muj-he doc-tor cha-hi-ye", script: "मुझे डॉक्टर चाहिए" },
        { english: "Call police", translation: "Police ko bulao", phonetic: "Po-lees ko bu-la-o", script: "पुलिस को बुलाओ" }
      ]
    }
  };
  return mocks[feature] || { message: "AI feature placeholder – set ANTHROPIC_API_KEY for real generation", feature };
}

module.exports = { getMockResponse };
