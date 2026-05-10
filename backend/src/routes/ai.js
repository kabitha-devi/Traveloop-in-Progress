const router = require('express').Router();
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { callAI } = require('../services/ai/claude');
const { getWeatherForStop, getForecast } = require('../services/weather/openweather');

router.use(authMiddleware);

// ─── Novelty #1: AI Trip Generator ───
router.post('/generate-trip', asyncHandler(async (req, res) => {
  const { query, budget, days, travelers, preferences } = req.body;

  const systemPrompt = `You are Traveloop AI — an expert travel planner. Generate a complete trip itinerary as valid JSON. Include: tripName, totalBudget, duration, stops (each with city, days, activities array with name/time/duration/cost/type/description, hotel with name/pricePerNight, transport with from/to/mode/cost), budgetBreakdown object, and tips array. Be specific with real places, practical timing. IMPORTANT: You MUST strictly adhere to the user's budget and not exceed it! Scale hotel and activity costs accordingly.`;

  const userMsg = `Plan a ${days || 5}-day trip: "${query}". Maximum Budget: $${budget || 'flexible'}. Travelers: ${travelers || 1}. Preferences: ${preferences || 'mixed activities'}.`;

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

  const systemPrompt = `You are a travel recommender. Given a city name, suggest 6 top, must-visit tourist attractions or activities. Return a JSON array. Each object MUST have: name, cost (number in USD), type (e.g. "Culture", "Nature"), and description (1-2 short sentences).`;

  let result = await callAI(systemPrompt, `Suggest 6 activities for ${city}`, req.user.id, 'suggest_activities');

  if (!Array.isArray(result) && result.activities) result = result.activities;
  if (!Array.isArray(result)) result = [];

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

module.exports = router;
