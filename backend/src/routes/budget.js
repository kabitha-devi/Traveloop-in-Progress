const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /trips/:tripId/budget
router.get('/', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.tripId },
    include: { stops: { include: { activities: true, expenses: true } } },
  });

  const categories = {};
  let totalSpent = 0;

  for (const stop of trip.stops) {
    for (const a of stop.activities) {
      const cat = a.category || 'Other';
      categories[cat] = (categories[cat] || 0) + a.cost;
      totalSpent += a.cost;
    }
    for (const e of stop.expenses) {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
      totalSpent += e.amount;
    }
  }

  sendSuccess(res, {
    totalBudget: trip.totalBudget,
    totalSpent,
    remaining: trip.totalBudget - totalSpent,
    percentage: trip.totalBudget > 0 ? (totalSpent / trip.totalBudget) * 100 : 0,
    breakdown: Object.entries(categories).map(([name, value]) => ({ name, value })),
  });
}));

// POST /trips/:tripId/budget/log — log actual expense
router.post('/log', asyncHandler(async (req, res) => {
  const { stopId, category, description, amount, currency } = req.body;
  const expense = await prisma.expense.create({
    data: { stopId, category, description, amount, currency },
  });
  sendSuccess(res, expense, 201);
}));

module.exports = router;
