const API_URL = 'http://localhost:5000/api';

/**
 * Make authenticated API requests to the Traveloop backend
 */
async function apiFetch(endpoint, options = {}) {
  const { default: useAuthStore } = await import('../store/authStore');
  const token = useAuthStore.getState().accessToken;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data;
}

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

// ── AI Feature APIs ──
export const aiApi = {
  generateTrip: (data) => api.post('/ai/generate-trip', data),
  moodPlanner: (data) => api.post('/ai/mood-planner', data),
  smartPacking: (tripId) => api.post(`/ai/smart-packing/${tripId}`),
  optimizeBudget: (tripId) => api.post(`/ai/optimize-budget/${tripId}`),
  detectConflicts: (tripId) => api.post(`/ai/detect-conflicts/${tripId}`),
  weatherReschedule: (tripId) => api.post(`/ai/weather-reschedule/${tripId}`),
  generateJournal: (tripId) => api.post(`/ai/generate-journal/${tripId}`),
  emergencyPhrases: (data) => api.post('/ai/emergency-phrases', data),
};

// ── Weather API ──
export const weatherApi = {
  getForecast: (city) => api.get(`/ai/forecast/${encodeURIComponent(city)}`),
};

// ── Trip APIs ──
export const tripApi = {
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};

// ── Search APIs ──
export const searchApi = {
  cities: (query) => api.get(`/search/cities?q=${encodeURIComponent(query)}`),
  destinations: (query) => api.get(`/search/destinations?q=${encodeURIComponent(query)}`),
};

export default api;
