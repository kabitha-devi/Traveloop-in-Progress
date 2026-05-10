import { activities } from '../data/activities';

export function useBudget(tripStops, totalBudget) {
  const totalSpent = tripStops.reduce((sum, stop) => {
    const stopActivitiesCost = stop.activities
      .map(aId => activities.find(a => a.id === aId))
      .filter(Boolean)
      .reduce((aSum, a) => aSum + a.cost, 0);
    return sum + stopActivitiesCost;
  }, 0);

  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const categoryBreakdown = {};
  tripStops.forEach(stop => {
    stop.activities.forEach(aId => {
      const activity = activities.find(a => a.id === aId);
      if (activity) {
        categoryBreakdown[activity.category] = (categoryBreakdown[activity.category] || 0) + activity.cost;
      }
    });
  });

  // Add accommodation estimate
  const accommodationCost = tripStops.reduce((sum, stop) => {
    const nights = Math.ceil((new Date(stop.endDate) - new Date(stop.startDate)) / (1000 * 60 * 60 * 24));
    return sum + (nights * 150); // average nightly rate
  }, 0);
  categoryBreakdown['Accommodation'] = accommodationCost;

  const chartData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name),
  }));

  return {
    totalSpent: totalSpent + accommodationCost,
    remaining: totalBudget - totalSpent - accommodationCost,
    percentage: totalBudget > 0 ? ((totalSpent + accommodationCost) / totalBudget) * 100 : 0,
    categoryBreakdown,
    chartData,
  };
}

function getCategoryColor(category) {
  const colors = {
    'Adventure': '#C084FC',
    'Food & Drink': '#FACC15',
    'Culture': '#4ADE80',
    'Wellness': '#38BDF8',
    'Shopping': '#FB923C',
    'Luxury': '#F472B6',
    'Nightlife': '#A78BFA',
    'Accommodation': '#6B2D6E',
  };
  return colors[category] || '#A89BB8';
}

export default useBudget;
