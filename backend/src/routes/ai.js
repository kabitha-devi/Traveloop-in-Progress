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

  const systemPrompt = `You are Traveloop AI — an expert travel planner. Generate a complete trip itinerary as valid JSON. Include: tripName, totalBudget, duration, stops (each with city, days, activities array with name/time/duration/cost/type/description, hotel with name/pricePerNight, transport with from/to/mode/cost), budgetBreakdown object, and tips array. Be specific with real places, realistic costs, and practical timing.`;

  const userMsg = `Plan a ${days || 5}-day trip: "${query}". Budget: $${budget || 'flexible'}. Travelers: ${travelers || 1}. Preferences: ${preferences || 'mixed activities'}.`;

  const result = await callAI(systemPrompt, userMsg, req.user.id, 'trip_generator');

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
router.post('/optimize-budget/:tripId', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: { include: { activities: true, expenses: true } } },
  });
  if (!trip) return sendError(res, 'Trip not found', 404);

  const tripData = JSON.stringify({
    budget: trip.totalBudget,
    stops: trip.stops.map(s => ({
      city: s.cityName,
      activities: s.activities.map(a => ({ name: a.name, cost: a.cost, category: a.category })),
      expenses: s.expenses.map(e => ({ category: e.category, amount: e.amount })),
    })),
  });

  const systemPrompt = `You are a travel budget optimizer. Analyze the trip spending and suggest savings. Return JSON with: savings array (each with category, currentCost, suggestedCost, suggestion, saving), totalPotentialSaving, newTotal.`;

  const result = await callAI(systemPrompt, `Optimize this trip budget:\n${tripData}`, req.user.id, 'budget_optimizer');
  sendSuccess(res, result);
}));

// ─── Novelty #6: Smart Packing AI ───
router.post('/smart-packing/:tripId', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: true },
  });
  if (!trip) return sendError(res, 'Trip not found', 404);

  // Fetch weather for first stop
  let weatherInfo = 'Unknown';
  if (trip.stops.length > 0) {
    const forecast = await getForecast(trip.stops[0].cityName);
    weatherInfo = JSON.stringify(forecast.slice(0, 3));
  }

  const systemPrompt = `You are a smart packing assistant. Based on destination, weather, trip duration, and activities, generate a packing list. Return JSON with: categories array, each having name and items array (each item has name, essential boolean, and optional reason string).`;

  const cities = trip.stops.map(s => s.cityName).join(', ');
  const dur = Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24));
  const userMsg = `Trip to ${cities}. Duration: ${dur} days. Dates: ${trip.startDate.toISOString().split('T')[0]} to ${trip.endDate.toISOString().split('T')[0]}. Weather: ${weatherInfo}. Mood: ${trip.mood || 'general'}.`;

  const result = await callAI(systemPrompt, userMsg, req.user.id, 'smart_packing');

  // Auto-add to checklist
  if (result.categories) {
    for (const cat of result.categories) {
      for (const item of cat.items || []) {
        await prisma.checklistItem.create({
          data: {
            tripId: trip.id,
            label: item.name,
            category: cat.name,
            essential: item.essential || false,
            aiGenerated: true,
            reason: item.reason || null,
          },
        });
      }
    }
  }

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
router.post('/detect-conflicts/:tripId', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: { include: { activities: true } } },
  });
  if (!trip) return sendError(res, 'Trip not found', 404);

  const tripData = JSON.stringify({
    budget: trip.totalBudget,
    stops: trip.stops.map(s => ({
      city: s.cityName,
      startDate: s.startDate,
      endDate: s.endDate,
      budget: s.budget,
      activities: s.activities.map(a => ({
        name: a.name, startTime: a.startTime, endTime: a.endTime,
        cost: a.cost, duration: a.duration,
      })),
    })),
  });

  const systemPrompt = `You are a trip conflict detector. Analyze the itinerary for scheduling overlaps, budget overruns, unrealistic timing, and logistic issues. Return JSON with: conflicts array (each with type, description, severity [low/medium/high], suggestion, and optional autoFix object).`;

  const result = await callAI(systemPrompt, `Detect conflicts:\n${tripData}`, req.user.id, 'conflict_detection');
  sendSuccess(res, result);
}));

// ─── Novelty #17: Weather-Aware Rescheduling ───
router.post('/weather-reschedule/:tripId', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: { include: { activities: true } } },
  });
  if (!trip) return sendError(res, 'Trip not found', 404);

  // Fetch weather for each stop
  const stopsWithWeather = [];
  for (const stop of trip.stops) {
    const forecast = await getForecast(stop.cityName);
    stopsWithWeather.push({
      city: stop.cityName,
      activities: stop.activities.map(a => ({
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
