import { create } from 'zustand';
import { trips as initialTrips } from '../data/trips';
import { stops as initialStops } from '../data/stops';

const useTripStore = create((set, get) => ({
  trips: initialTrips,
  stops: initialStops,
  selectedTrip: null,

  setSelectedTrip: (tripId) => {
    const trip = get().trips.find(t => t.id === tripId);
    set({ selectedTrip: trip || null });
  },

  getTripsByStatus: (status) => {
    return get().trips.filter(t => t.status === status);
  },

  getTripsByUser: (userId) => {
    return get().trips.filter(t => t.userId === userId);
  },

  getStopsByTrip: (tripId) => {
    return get().stops.filter(s => s.tripId === tripId);
  },

  addTrip: (tripData) => {
    const newTrip = {
      id: `t${Date.now()}`,
      status: 'upcoming',
      totalSpent: 0,
      stops: [],
      ...tripData,
    };
    set((state) => ({ trips: [...state.trips, newTrip] }));
    return newTrip;
  },

  updateTrip: (tripId, updates) => {
    set((state) => ({
      trips: state.trips.map(t => t.id === tripId ? { ...t, ...updates } : t),
      selectedTrip: state.selectedTrip?.id === tripId
        ? { ...state.selectedTrip, ...updates }
        : state.selectedTrip,
    }));
  },

  deleteTrip: (tripId) => {
    set((state) => ({
      trips: state.trips.filter(t => t.id !== tripId),
      stops: state.stops.filter(s => s.tripId !== tripId),
      selectedTrip: state.selectedTrip?.id === tripId ? null : state.selectedTrip,
    }));
  },

  addStop: (stopData) => {
    const newStop = {
      id: `s${Date.now()}`,
      activities: [],
      ...stopData,
    };
    set((state) => ({
      stops: [...state.stops, newStop],
      trips: state.trips.map(t =>
        t.id === stopData.tripId
          ? { ...t, stops: [...t.stops, newStop.id] }
          : t
      ),
    }));
    return newStop;
  },

  updateStop: (stopId, updates) => {
    set((state) => ({
      stops: state.stops.map(s => s.id === stopId ? { ...s, ...updates } : s),
    }));
  },

  deleteStop: (stopId) => {
    const stop = get().stops.find(s => s.id === stopId);
    set((state) => ({
      stops: state.stops.filter(s => s.id !== stopId),
      trips: state.trips.map(t =>
        t.id === stop?.tripId
          ? { ...t, stops: t.stops.filter(id => id !== stopId) }
          : t
      ),
    }));
  },

  reorderStops: (tripId, newStopIds) => {
    set((state) => ({
      trips: state.trips.map(t =>
        t.id === tripId ? { ...t, stops: newStopIds } : t
      ),
    }));
  },
}));

export default useTripStore;
