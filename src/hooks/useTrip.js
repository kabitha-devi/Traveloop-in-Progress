import useTripStore from '../store/tripStore';
import { activities } from '../data/activities';

export function useTrip(tripId) {
  const trips = useTripStore((state) => state.trips);
  const stops = useTripStore((state) => state.stops);
  const trip = tripId ? trips.find(t => t.id === tripId) : null;
  const tripStops = tripId ? stops.filter(s => s.tripId === tripId) : [];

  const getActivitiesForStop = (stopId) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return [];
    return stop.activities.map(aId => activities.find(a => a.id === aId)).filter(Boolean);
  };

  const totalBudget = tripStops.reduce((sum, s) => sum + (s.budget || 0), 0);
  const dayCount = trip
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return {
    trip,
    stops: tripStops,
    getActivitiesForStop,
    totalBudget,
    dayCount,
    cityCount: tripStops.length,
  };
}

export default useTrip;
