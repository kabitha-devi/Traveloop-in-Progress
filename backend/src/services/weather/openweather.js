const prisma = require('../../utils/prisma');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch weather for a stop's city. Caches results per day.
 */
async function getWeatherForStop(stopId) {
  const stop = await prisma.stop.findUnique({ where: { id: stopId } });
  if (!stop) return null;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER') {
    return getMockWeather(stop.cityName);
  }

  // Check cache first (fetched today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cached = await prisma.weatherCache.findFirst({
    where: { stopId, fetchedAt: { gte: today } },
  });
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(stop.cityName)}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      console.error('Weather API error:', data.message);
      return getMockWeather(stop.cityName);
    }

    const weather = await prisma.weatherCache.upsert({
      where: { stopId_date: { stopId, date: today } },
      create: {
        stopId,
        date: today,
        temp: data.main?.temp,
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        condition: data.weather?.[0]?.main?.toLowerCase(),
        icon: data.weather?.[0]?.icon,
        windSpeed: data.wind?.speed,
        rainChance: data.rain?.['1h'] || 0,
      },
      update: {
        temp: data.main?.temp,
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        condition: data.weather?.[0]?.main?.toLowerCase(),
        icon: data.weather?.[0]?.icon,
        windSpeed: data.wind?.speed,
        rainChance: data.rain?.['1h'] || 0,
      },
    });
    return weather;
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    return getMockWeather(stop.cityName);
  }
}

/**
 * Get 5-day forecast for a city
 */
async function getForecast(cityName) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER') {
    return getMockForecast(cityName);
  }

  try {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric&cnt=40`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== '200') return getMockForecast(cityName);

    // Group by day
    const days = {};
    for (const item of data.list) {
      const day = item.dt_txt.split(' ')[0];
      if (!days[day]) {
        days[day] = {
          date: day,
          temp: item.main.temp,
          feelsLike: item.main.feels_like,
          humidity: item.main.humidity,
          condition: item.weather[0]?.main?.toLowerCase(),
          icon: item.weather[0]?.icon,
          windSpeed: item.wind?.speed,
          rainChance: item.pop * 100,
        };
      }
    }
    return Object.values(days);
  } catch (err) {
    console.error('Forecast fetch error:', err.message);
    return getMockForecast(cityName);
  }
}

function getMockWeather(city) {
  return {
    temp: 28, feelsLike: 30, humidity: 65,
    condition: 'sunny', icon: '01d', windSpeed: 3.5, rainChance: 10,
    city, mock: true,
  };
}

function getMockForecast(city) {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      temp: 25 + Math.random() * 8,
      feelsLike: 27 + Math.random() * 8,
      humidity: 50 + Math.random() * 30,
      condition: ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy'][i],
      icon: ['01d', '03d', '10d', '01d', '03d'][i],
      windSpeed: 2 + Math.random() * 5,
      rainChance: [5, 20, 70, 10, 30][i],
    });
  }
  return days;
}

module.exports = { getWeatherForStop, getForecast };
