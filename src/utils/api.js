import useAuthStore from '../store/authStore';

const API_URL = 'http://localhost:5000/api';

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.data?.accessToken) return null;

    useAuthStore.setState({ accessToken: data.data.accessToken, isAuthenticated: true });
    return data.data.accessToken;
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
}

/**
 * Make authenticated API requests to the Traveloop backend
 */
async function apiFetch(endpoint, options = {}, shouldRetry = true) {
  const token = useAuthStore.getState().accessToken;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401 && shouldRetry) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return apiFetch(endpoint, options, false);
    }

    useAuthStore.setState({ currentUser: null, isAuthenticated: false, accessToken: null });
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

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
  chat: (data) => api.post('/ai/chat', data),
  moodPlanner: (data) => api.post('/ai/mood-planner', data),
  optimizeBudget: (data) => api.post(`/ai/optimize-budget`, data),
  detectConflicts: (data) => api.post(`/ai/detect-conflicts`, data),
  weatherReschedule: (data) => api.post(`/ai/weather-reschedule`, data),
  generateJournal: (tripId) => api.post(`/ai/generate-journal/${tripId}`),
  emergencyPhrases: (data) => api.post('/ai/emergency-phrases', data),
  suggestActivities: (city) => api.get(`/ai/suggest-activities?city=${encodeURIComponent(city)}`),
  getActivityDetails: (city, title) => api.get(`/ai/activity-details?city=${encodeURIComponent(city)}&title=${encodeURIComponent(title)}`),
};

// ── Smart Packing APIs ──
export const packingApi = {
  generate: (data) => api.post('/ai/packing/generate', data),
  gamify: (data) => api.post('/ai/packing/gamify', data),
  addons: (data) => api.post('/ai/packing/addons', data),
  share: (data) => api.post('/ai/packing/share', data),
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

// ── Community APIs ──
export const communityApi = {
  getFeed: (count) => api.post('/ai/community/feed', { count }),
  analyzeReview: (data) => api.post('/ai/community/review', data),
  generateCaption: (data) => api.post('/ai/community/caption', data),
  getTrending: (month) => api.get(`/ai/community/trending?month=${encodeURIComponent(month || '')}`),
  getInspiration: (profile) => api.post('/ai/community/inspiration', profile)
};

export default api;
