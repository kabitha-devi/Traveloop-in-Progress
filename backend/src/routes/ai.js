const router = require('express').Router();
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { callAI } = require('../services/ai/claude');
const { getWeatherForStop, getForecast } = require('../services/weather/openweather');

router.use(authMiddleware);

// ─── Novelty #1: AI Trip Generator ───
router.post('/generate-trip', asyncHandler(async (req, res) => {
  const { query, budget, days, travelers, preferences, isBleisure, businessCommitments } = req.body;

  let systemPrompt = `You are Traveloop AI — an expert travel planner. Generate a complete trip itinerary as valid JSON. Include: tripName, totalBudget, duration, stops (each with city, days, activities array with name/time/duration/cost/type/description, hotel with name/pricePerNight, transport with from/to/mode/cost), budgetBreakdown object, and tips array. Be specific with real places, practical timing. IMPORTANT: You MUST strictly adhere to the user's budget and not exceed it! Scale hotel and activity costs accordingly.`;
  
  if (isBleisure) {
    systemPrompt += ` This is a BLEISURE trip (Business + Leisure). You MUST schedule the following business commitments strictly as requested, and then optimally wrap personalized leisure activities around them. Ensure the itinerary bridges the gap between corporate travel and personal vacation gracefully.`;
  }

  const userMsg = `Plan a ${days || 5}-day trip: "${query}". Maximum Budget: $${budget || 'flexible'}. Travelers: ${travelers || 1}. Preferences: ${preferences || 'mixed activities'}.${isBleisure ? ` Business Commitments: ${businessCommitments}` : ''}`;

  const result = await callAI(systemPrompt, userMsg, req.user.id, 'trip_generator', { budget: parseInt(budget) || 5000, destination: query, days: parseInt(days) || 5 });

  // Auto-save as a trip if generation was successful
  if (result.stops && result.stops.length > 0) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (parseInt(days) || 5));

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name: result.tripName || 'AI Generated Trip',
        description: query,
        startDate,
        endDate,
        totalBudget: result.totalBudget || budget || 0,
        source: 'ai_generated',
        mood: preferences,
        stops: {
          create: result.stops.map((s, i) => ({
            cityName: s.city,
            startDate,
            endDate,
            budget: s.hotel ? s.hotel.pricePerNight * (s.days || 1) : 0,
            position: i,
            activities: {
              create: (s.activities || []).map((a, j) => ({
                name: a.name,
                category: a.type || 'General',
                description: a.description,
                cost: a.cost || 0,
                duration: a.duration,
                position: j,
                isAiGenerated: true,
              })),
            },
          })),
        },
      },
      include: { stops: { include: { activities: true } } },
    });
    result.savedTripId = trip.id;
  }

  sendSuccess(res, result, 201);
}));

// ─── Novelty #2: Mood-Based Planner ───
router.post('/mood-planner', asyncHandler(async (req, res) => {
  const { mood, destination, budget, days } = req.body;

  const systemPrompt = `You are a mood-sensitive travel designer. Given a mood, generate a trip perfectly tailored to that emotional state. Return JSON with: tripName, mood, stops array (city, days, activities with name/time/duration/cost/type), budgetBreakdown, and tips. Moods: adventure=thrilling activities, relax=spa/beach/slow, romantic=couples experiences, healing=nature/spiritual, party=nightlife/festivals, spiritual=temples/retreats.`;

  const userMsg = `Mood: ${mood}. ${destination ? `Destination: ${destination}.` : 'Suggest best destinations.'} Budget: $${budget || 'flexible'}. Days: ${days || 5}.`;

  const result = await callAI(systemPrompt, userMsg, req.user.id, 'mood_planner');
  sendSuccess(res, result);
}));

// ─── Novelty #4: Budget Optimizer ───
router.post('/optimize-budget', asyncHandler(async (req, res) => {
  const { budget, stops } = req.body;
  if (!stops) return sendError(res, 'Trip data not provided', 400);

  const tripData = JSON.stringify({
    budget: budget || 0,
    stops: stops.map(s => ({
      city: s.cityName || s.city,
      activities: (s.activities || []).map(a => ({ name: a.name, cost: a.cost, category: a.category || a.type })),
      expenses: (s.expenses || []).map(e => ({ category: e.category, amount: e.amount })),
    })),
  });

  const systemPrompt = `You are a travel budget optimizer. Analyze the trip spending and suggest savings. Return JSON with: savings array (each with category, currentCost, suggestedCost, suggestion, saving), totalPotentialSaving, newTotal.`;

  const result = await callAI(systemPrompt, `Optimize this trip budget:\n${tripData}`, req.user.id, 'budget_optimizer');
  sendSuccess(res, result);
}));

// ─── Novelty #6: Smart Packing AI ───
router.post('/smart-packing', asyncHandler(async (req, res) => {
  const { tripName, destination, days, mood, stops } = req.body;

  // Try to fetch weather for the first destination
  let weatherInfo = 'Unknown';
  const firstCity = destination || (stops && stops[0]?.cityName);
  if (firstCity) {
    try {
      const forecast = await getForecast(firstCity);
      weatherInfo = JSON.stringify(forecast.slice(0, 3));
    } catch (e) { /* ignore weather errors */ }
  }

  const cities = stops ? stops.map(s => s.cityName).join(', ') : (destination || 'the destination');
  const systemPrompt = `You are a smart packing assistant. Based on destination, weather, trip duration, and activities, generate a packing list. Return JSON with: categories array, each having name and items array (each item has name, essential boolean, and optional reason string).`;
  const userMsg = `Trip to ${cities}. Duration: ${days || 5} days. Weather: ${weatherInfo}. Mood: ${mood || 'general'}.`;

  const result = await callAI(systemPrompt, userMsg, req.user.id, 'smart_packing');
  sendSuccess(res, result);
}));

// ─── Novelty #9: AI Journal Generator ───
router.post('/generate-journal/:tripId', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: { include: { activities: true } }, notes: true },
  });
  if (!trip) return sendError(res, 'Trip not found', 404);

  const tripData = JSON.stringify({
    name: trip.name,
    stops: trip.stops.map(s => ({
      city: s.cityName,
      activities: s.activities.map(a => a.name),
    })),
    notes: trip.notes.map(n => n.body).filter(Boolean).join('\n'),
  });

  const systemPrompt = `You are a travel storyteller. Write a beautiful travel journal from trip data. Return JSON with: title, story (500-800 words, first person, vivid and emotional), dayHighlights array (each with day number, headline, body), and coverCaption.`;

  const result = await callAI(systemPrompt, `Write a journal for this trip:\n${tripData}`, req.user.id, 'journal_generator');

  // Save journal
  if (result.title && result.story) {
    await prisma.journal.upsert({
      where: { tripId: trip.id },
      create: {
        tripId: trip.id,
        title: result.title,
        story: result.story,
        coverCaption: result.coverCaption,
        highlights: {
          create: (result.dayHighlights || []).map(h => ({
            day: h.day, headline: h.headline, body: h.body,
          })),
        },
      },
      update: {
        title: result.title,
        story: result.story,
        coverCaption: result.coverCaption,
      },
    });
  }

  sendSuccess(res, result);
}));

// ─── Novelty #13: Conflict Detection ───
router.post('/detect-conflicts', asyncHandler(async (req, res) => {
  const { budget, stops } = req.body;
  if (!stops) return sendError(res, 'Trip data not provided', 400);

  const tripData = JSON.stringify({
    budget: budget || 0,
    stops: (stops || []).map(s => ({
      city: s.cityName || s.city,
      startDate: s.startDate,
      endDate: s.endDate,
      budget: s.budget,
      activities: (s.activities || []).map(a => ({
        name: a.name || a, startTime: a.startTime, endTime: a.endTime,
        cost: a.cost, duration: a.duration,
      })),
    })),
  });

  const systemPrompt = `You are a trip conflict detector. Analyze the itinerary for scheduling overlaps, budget overruns, unrealistic timing, and logistic issues. Return JSON with: conflicts array (each with type, description, severity [low/medium/high], suggestion, and optional autoFix object).`;

  const result = await callAI(systemPrompt, `Detect conflicts:\n${tripData}`, req.user.id, 'conflict_detection');
  sendSuccess(res, result);
}));

// ─── Novelty #17: Weather-Aware Rescheduling ───
router.post('/weather-reschedule', asyncHandler(async (req, res) => {
  const { stops } = req.body;
  if (!stops || stops.length === 0) return sendError(res, 'No stops provided', 400);

  // Fetch weather for each stop
  const stopsWithWeather = [];
  for (const stop of stops) {
    if (!stop.cityName) continue;
    const forecast = await getForecast(stop.cityName);
    stopsWithWeather.push({
      city: stop.cityName,
      activities: (stop.activities || []).map(a => ({
        name: a.name, isIndoor: a.isIndoor, startTime: a.startTime,
      })),
      weather: forecast,
    });
  }

  const systemPrompt = `You are a weather-aware trip optimizer. Given forecast data, suggest rescheduling outdoor activities away from bad weather days. Return JSON with: recommendations array (each with day, issue, affectedActivities array, suggestion, autoReschedule boolean).`;

  const result = await callAI(
    systemPrompt,
    `Reschedule based on weather:\n${JSON.stringify(stopsWithWeather)}`,
    req.user.id,
    'weather_reschedule'
  );
  sendSuccess(res, result);
}));

// ─── Novelty: Emergency Phrases ───
router.post('/emergency-phrases', asyncHandler(async (req, res) => {
  const { country, language } = req.body;

  const systemPrompt = `You are an emergency language assistant for travelers. Generate essential emergency phrases translated into the local language. Return JSON with: phrases array (each with english, translation, phonetic pronunciation, and script in native writing system).`;

  const result = await callAI(
    systemPrompt,
    `Generate emergency phrases for a traveler in ${country || 'unknown country'} where ${language || 'the local language'} is spoken. Include: help, doctor, police, embassy, hospital, fire, allergic reaction, lost passport, directions.`,
    req.user.id,
    'emergency_phrases'
  );
  sendSuccess(res, result);
}));

// ─── Novelty #18: Dynamic Suggested Activities ───
router.get('/suggest-activities', asyncHandler(async (req, res) => {
  const { city } = req.query;
  if (!city) return sendError(res, 'City is required', 400);

  const systemPrompt = `You are a travel activity expert with deep local knowledge of cities worldwide. When given a city name, you return real, specific, hyper-local activity recommendations — never generic placeholders. Always mention actual neighborhoods, landmarks, venues, and local experiences that are genuinely tied to that city.
Generate exactly 9 real, specific, diverse activity recommendations for ${city}.

Return ONLY a valid JSON array. No markdown, no backticks, no explanation — raw JSON only.

Each object must have these exact fields:
- title: string (specific to ${city}, not generic — e.g. "Tsukiji Outer Market Morning Tour" not "Local Market Experience")
- category: one of ["Culture", "Food & Drink", "Nature", "Shopping", "Adventure", "Wellness"]
- description: string (2 sentences — mention real places, neighborhoods, or landmarks in ${city})
- duration: string (e.g. "2 hours", "Half day", "3–4 hours")
- price: string (e.g. "Free", "$15", "$30–50", "₹500")
- best_for: string (e.g. "Families", "Solo travelers", "Couples", "Food lovers")

Diversity rules — ensure at least:
- 2 Culture activities
- 2 Food & Drink activities
- 1 Nature activity
- 1 Shopping activity
- remaining 3 can be any mix

Output only the JSON array. Start your response with [ and end with ].`;

  let result = await callAI(systemPrompt, `Suggest 9 specific, real, iconic activities for ${city}`, req.user.id, 'suggest_activities', { destination: city });

  if (!Array.isArray(result) && result.activities) result = result.activities;
  if (!Array.isArray(result)) result = [];

  // Map the new prompt's fields to the expected format for the frontend
  result = result.map(act => ({
    ...act,
    name: act.title || act.name,
    type: act.category || act.type,
    bestFor: act.best_for || act.bestFor,
    // Provide both the raw string price and a fallback numeric cost for compatibility
    priceStr: act.price,
    cost: typeof act.cost !== 'undefined' ? act.cost : (act.price && act.price.toLowerCase() === 'free' ? 0 : undefined)
  }));

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey && !unsplashKey.includes('PLACEHOLDER') && unsplashKey !== 'your_unsplash_key') {
    const withPhotos = await Promise.all(result.slice(0, 6).map(async (act) => {
      try {
        const query = encodeURIComponent(`${act.name} ${city} travel`);
        const photoRes = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashKey}`);
        const photoData = await photoRes.json();
        if (photoData.results && photoData.results.length > 0) {
          act.image = photoData.results[0].urls.regular;
        } else {
          act.image = `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80`;
        }
      } catch (err) {
        act.image = `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80`;
      }
      return act;
    }));
    return sendSuccess(res, withPhotos);
  }

  const withFallbackPhotos = result.map(act => ({
    ...act,
    image: `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80`
  }));
  sendSuccess(res, withFallbackPhotos);
}));

// ─── Weather Endpoint ───
router.get('/weather/:stopId', asyncHandler(async (req, res) => {
  const weather = await getWeatherForStop(req.params.stopId);
  sendSuccess(res, weather);
}));

router.get('/forecast/:city', asyncHandler(async (req, res) => {
  const forecast = await getForecast(req.params.city);
  sendSuccess(res, forecast);
}));

// ─── Novelty: Deep Activity Details with Web Search ───
router.get('/activity-details', asyncHandler(async (req, res) => {
  const { city, title } = req.query;
  if (!city || !title) return sendError(res, 'City and title are required', 400);

  const systemPrompt = `You are a travel research agent with web search capability. When given an activity or place name and city, you search the official website and trusted travel sources to extract real, accurate details. Never fabricate information — only return what you can verify.
A user clicked on "${title}" in ${city}.

Search the official website and top travel sources for this place and return a JSON object with the following fields:

{
  "title": "string",
  "city": "string",
  "category": "string",
  "tagline": "string (one-line description)",
  "about": "string (2–3 sentences from official source)",
  "highlights": ["string", "string", "string", "string"],
  "cost": "string (e.g. Free, $10, ₹500)",
  "duration": "string (e.g. 2–3 hours)",
  "min_age": "string (e.g. All ages, 12+)",
  "best_for": "string (e.g. Families, Solo travelers)",
  "includes": "string (what is included in the visit/ticket)",

  "accommodation": {
    "available": true or false,
    "options": ["string", "string"],
    "price_range": "string",
    "booking_link": "string (official URL or null)"
  },

  "food": {
    "available": true or false,
    "options": ["string", "string"],
    "details": "string (type of cuisine, timings, or canteen info)"
  },

  "facilities": ["string", "string", "string"],

  "contact": {
    "phone": "string or null",
    "email": "string or null",
    "website": "string (official URL)",
    "address": "string"
  },

  "source": "string (URL of the official website used)"
}

Rules:
- Search the official website first, then fallback to verified sources like Lonely Planet, TripAdvisor, or government tourism sites.
- If a field is unknown, set it to null — do not guess.
- Return only raw JSON. No markdown, no explanation.`;

  // enableSearch = true to use Gemini native googleSearch tool
  const result = await callAI(systemPrompt, `Find exact details for ${title} in ${city}`, req.user.id, 'activity_details', { destination: city, title }, true);
  
  sendSuccess(res, result);
}));

// ─── COMMUNITY AI ENDPOINTS ───

router.post('/community/feed', asyncHandler(async (req, res) => {
  const { count = 10 } = req.body;
  const systemPrompt = `You are a travel community content generator. Generate ${count} realistic community trip posts for a travel app.

Return ONLY a raw JSON array. No markdown, no explanation.

Each object must have:
{
  "id": "string (unique)",
  "user": {
    "name": "string (realistic full name)",
    "avatar_initial": "string (first letter of first name)",
    "avatar_color": "one of [purple, teal, coral, amber, blue]",
    "location": "string (user's home city, country)",
    "trips_count": number,
    "followers": number
  },
  "trip": {
    "title": "string (catchy trip name)",
    "tagline": "string (one-line hook)",
    "destinations": ["string"],
    "days": number,
    "stops": number,
    "travel_style": "one of [Adventure, Luxury, Budget, Cultural, Wellness, Family]",
    "month_year": "string (e.g. March 2025)"
  },
  "media": [
    {
      "type": "photo",
      "caption": "string (short caption for the photo)",
      "location_tag": "string (specific place name)",
      "placeholder_description": "string (describe what the photo shows, for UI placeholder)"
    }
  ],
  "stats": {
    "copies": number,
    "likes": number,
    "comments": number,
    "saves": number
  },
  "highlights": ["string", "string", "string"],
  "budget_per_person": "string (e.g. $1200, ₹45,000)",
  "rating": number,
  "tags": ["string", "string"]
}`;

  const result = await callAI(systemPrompt, `Generate ${count} community trip posts.`, req.user.id, 'community_feed', { count });
  sendSuccess(res, result);
}));

router.post('/community/review', asyncHandler(async (req, res) => {
  const { tripTitle, destinations, reviewText, rating } = req.body;
  
  const systemPrompt = `A traveler just submitted a review for a community trip post. Analyze the review and return enriched structured data.

Trip title: ${tripTitle}
Destinations: ${destinations?.join(', ')}
User review text: "${reviewText}"
Star rating given: ${rating}/5

Return ONLY a raw JSON object:
{
  "sentiment": "one of [positive, neutral, mixed, negative]",
  "summary": "string (1 sentence AI summary of the review)",
  "highlights_mentioned": ["string"],
  "concerns_mentioned": ["string"],
  "helpful_tags": ["string (e.g. Great for families, Budget-friendly, Overrated, Hidden gem)"],
  "reply_suggestion": "string (a warm, helpful community reply the app can show as AI suggestion)",
  "display_review": {
    "short_version": "string (under 100 chars, for card preview)",
    "full_version": "string (full review text as submitted)"
  }
}`;

  const result = await callAI(systemPrompt, `Analyze review for ${tripTitle}`, req.user.id, 'community_review', { tripTitle });
  sendSuccess(res, result);
}));

router.post('/community/caption', asyncHandler(async (req, res) => {
  const { mediaType = 'photo', destination, note = '' } = req.body;
  
  const systemPrompt = `A traveler uploaded a ${mediaType} from their trip to ${destination}.
Their optional note: "${note}"

Generate engaging social-style content for this post.

Return ONLY a raw JSON object:
{
  "suggested_caption": "string (engaging, 1–2 sentences, travel vibe)",
  "hashtags": ["string", "string", "string", "string", "string"],
  "location_tag_suggestion": "string (specific landmark or neighborhood)",
  "mood": "one of [Adventurous, Relaxed, Cultural, Foodie, Luxurious, Spiritual]",
  "alt_captions": ["string", "string"] 
}`;

  const result = await callAI(systemPrompt, `Generate caption for ${destination}`, req.user.id, 'community_caption', { destination });
  sendSuccess(res, result);
}));

router.get('/community/trending', asyncHandler(async (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const systemPrompt = `Based on current travel trends, generate trending destination data for a travel community app.
Consider seasonal relevance for ${currentMonth}.

Return ONLY a raw JSON array of 8 destinations:
{
  "rank": number,
  "city": "string",
  "country": "string",
  "trend_reason": "string (1 sentence — why it's trending now)",
  "avg_trip_cost": "string",
  "best_month": "string",
  "travel_style": "string",
  "community_posts": number (realistic count),
  "trending_activity": "string (most popular activity there right now)"
}`;

  // Use enableSearch = true for live seasonal data
  const result = await callAI(systemPrompt, `Generate top 8 trending destinations for ${currentMonth}`, req.user.id, 'community_trending', { currentMonth }, true);
  sendSuccess(res, result);
}));

router.post('/community/inspiration', asyncHandler(async (req, res) => {
  const { homeCity, pastTrips, interests, budget, travelStyle } = req.body;
  
  const systemPrompt = `A user is browsing the community section of a travel app.

Their profile:
- Home city: ${homeCity || 'Unknown'}
- Past trips: ${pastTrips || 'Unknown'}
- Interests: ${interests || 'General travel'}
- Budget preference: ${budget || 'Moderate'}
- Travel style: ${travelStyle || 'Balanced'}

Recommend 3 community trips from the feed they would most love, and explain why.

Return ONLY a raw JSON array:
{
  "trip_id": "string",
  "match_score": number (0–100),
  "reason": "string (1–2 sentences, personal and specific)",
  "highlight_for_user": "string (what this user will love most about this trip)"
}`;

  const result = await callAI(systemPrompt, `Generate inspiration for user from ${homeCity}`, req.user.id, 'community_inspiration', { homeCity });
  sendSuccess(res, result);
}));

// ─── SMART PACKING AI ENDPOINTS ───

router.post('/packing/generate', asyncHandler(async (req, res) => {
  const { tripName, destinations, duration, travelStyle, travelMonth, activitiesList, travelerType, budget } = req.body;
  
  const systemPrompt = `You are an expert travel packing assistant. A traveler is preparing for a specific trip and needs a personalized, complete packing list.

Trip Details:
- Trip Name: ${tripName || 'Upcoming Trip'}
- Destinations: ${destinations?.join(', ') || 'Unknown'}
- Duration: ${duration || 'A few'} days
- Travel Style: ${travelStyle || 'Standard'}
- Season/Month of Travel: ${travelMonth || 'Unknown'}
- Activities Planned: ${activitiesList?.join(', ') || 'General sightseeing'}
- Traveler Type: ${travelerType || 'Solo'}
- Budget Level: ${budget || 'Mid-range'}

Generate a complete, trip-specific packing list. Return ONLY a raw JSON object:

{
  "trip_summary": "string (1 sentence about why this list is tailored to this trip)",
  "weather_note": "string (expected weather and what to prepare for)",
  "categories": [
    {
      "id": "string",
      "name": "string (e.g. Documents, Clothing, Electronics)",
      "icon": "string (emoji)",
      "priority": "one of [Essential, Recommended, Optional]",
      "items": [
        {
          "id": "string",
          "name": "string",
          "quantity": "string (e.g. x3, 1 pair, as needed)",
          "why": "string (1 short reason this is relevant to THIS trip specifically)",
          "priority": "one of [Must-have, Recommended, Nice-to-have]",
          "packed": false
        }
      ]
    }
  ],
  "pro_tips": ["string", "string", "string"],
  "weight_warning": "string or null (if list seems heavy, give a tip)",
  "dont_forget": ["string (quirky or commonly forgotten item specific to destination)"]
}

Rules:
- Minimum 6 categories, 5+ items each
- Items must be SPECIFIC to the destinations and activities — not generic
- For beach destinations: include reef-safe sunscreen, rash guard, etc.
- For cold climates: include thermal layers, hand warmers, etc.
- For spiritual/temple destinations: include modest clothing, scarves
- For adventure trips: include first aid, trekking poles, etc.
- Mention specific destination needs (e.g. "Tokyo: IC card holder for metro", "Morocco: cash in dirhams")
- Return raw JSON only`;

  const result = await callAI(systemPrompt, `Generate packing list for ${tripName}`, req.user.id, 'packing_core', { tripName });
  sendSuccess(res, result);
}));

router.post('/packing/gamify', asyncHandler(async (req, res) => {
  const { tripName, destinations, packedCount, totalCount, completedCategories, daysUntilTrip } = req.body;
  
  const systemPrompt = `A traveler is packing for ${tripName || 'a trip'} to ${destinations?.join(', ') || 'their destination'}.
They have packed ${packedCount} out of ${totalCount} items.
Categories completed: ${completedCategories?.join(', ') || 'None'}
Time until trip: ${daysUntilTrip || 7} days

Generate engagement content to motivate them. Return ONLY raw JSON:

{
  "progress_message": "string (fun, encouraging message based on their progress %)",
  "current_badge": {
    "name": "string (e.g. 'Half-way Hero', 'Document Master')",
    "emoji": "string",
    "unlocked": true or false
  },
  "next_badge": {
    "name": "string",
    "emoji": "string",
    "items_remaining": number
  },
  "urgency_message": "string or null (if trip is within 3 days, show urgency)",
  "packing_tip_of_day": "string (specific to their destination)",
  "challenge": {
    "title": "string (e.g. 'Pack your documents in the next 10 mins!')",
    "reward": "string (badge or XP reward)"
  }
}`;

  const result = await callAI(systemPrompt, `Generate gamification for ${tripName}`, req.user.id, 'packing_gamify', { packedCount, totalCount });
  sendSuccess(res, result);
}));

router.post('/packing/addons', asyncHandler(async (req, res) => {
  const { destinations, duration, activities, existingItems } = req.body;
  
  const systemPrompt = `A traveler is going to ${destinations?.join(', ') || 'their destination'} for ${duration || 'a few'} days doing ${activities?.join(', ') || 'sightseeing'}.
They have already added these items: ${existingItems?.join(', ') || 'Basic clothes and toiletries'}

Suggest 6 clever add-ons they probably haven't thought of. Return ONLY raw JSON array:

[
  {
    "name": "string",
    "category": "string",
    "why": "string (destination-specific reason)",
    "buy_link_search": "string (search term to find this on Amazon/Flipkart)",
    "estimated_cost": "string",
    "surprise_factor": "one of [Obvious, Smart, Life-saver, Unexpected]"
  }
]

Focus on:
- Items specific to the destination culture (e.g. "Pocket umbrella — Tokyo has sudden rain showers")
- Safety items travelers overlook
- Comfort items for long journeys
- Destination-specific necessities (plug adapters, local SIM, offline maps)`;

  const result = await callAI(systemPrompt, `Generate smart addons for ${destinations?.join(', ')}`, req.user.id, 'packing_addons', { destinations });
  sendSuccess(res, result);
}));

router.post('/packing/share', asyncHandler(async (req, res) => {
  const { tripName, destinations, packedItems, unpackedItems } = req.body;
  
  const systemPrompt = `A traveler wants to share their packing list for ${tripName || 'a trip'} to ${destinations?.join(', ') || 'their destination'}.
Packed items: ${packedItems?.join(', ') || 'None'}
Unpacked items: ${unpackedItems?.join(', ') || 'Everything'}

Generate a shareable summary. Return ONLY raw JSON:

{
  "share_title": "string (catchy title for the shared list)",
  "share_description": "string (2 sentences, travel-community style)",
  "readiness_score": number (0–100, based on % packed and category coverage),
  "readiness_label": "string (e.g. 'Almost Ready!', 'Good to Go!', 'Needs Attention')",
  "packed_summary": "string (e.g. '14/20 items packed across 5 categories')",
  "missing_essentials": ["string (unpacked must-have items only)"],
  "hashtags": ["string", "string", "string"],
  "share_text": "string (Instagram/WhatsApp style caption for sharing)"
}`;

  const result = await callAI(systemPrompt, `Generate share summary for ${tripName}`, req.user.id, 'packing_share', { tripName });
  sendSuccess(res, result);
}));

// ─── Chatbot Endpoint ───
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const systemPrompt = `You are Groq, the AI travel assistant for Traveloop. Keep answers concise, helpful, and travel-focused. Use a friendly, slightly witty tone. Return your response as a JSON object with a single "reply" field containing your response string.`;
  
  const userMsg = history && history.length > 0 
    ? `Chat history:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nUser: ${message}` 
    : message;
  
  const result = await callAI(systemPrompt, userMsg, req.user.id, 'chatbot');
  sendSuccess(res, result);
}));

module.exports = router;
