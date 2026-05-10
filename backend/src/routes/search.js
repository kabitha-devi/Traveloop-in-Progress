const router = require('express').Router();
const prisma = require('../utils/prisma');
const { sendSuccess, asyncHandler } = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

// GET /search/cities
router.get('/cities', asyncHandler(async (req, res) => {
  const { q, region, budget } = req.query;
  const where = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { country: { contains: q, mode: 'insensitive' } }];
  if (region) where.region = { equals: region, mode: 'insensitive' };
  if (budget) where.costIndex = { lte: parseInt(budget) };

  const cities = await prisma.city.findMany({ where, orderBy: { popularity: 'desc' }, take: 50 });
  sendSuccess(res, cities);
}));

// GET /search/activities
router.get('/activities', asyncHandler(async (req, res) => {
  const { q, type, cost, duration } = req.query;
  const where = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
  if (type) where.category = { equals: type, mode: 'insensitive' };
  if (cost) where.cost = { lte: parseFloat(cost) };

  // Search in all activities across all stops
  const activities = await prisma.activity.findMany({
    where, orderBy: { name: 'asc' }, take: 50,
    distinct: ['name'],
    select: { id: true, name: true, category: true, cost: true, duration: true, description: true, image: true, isIndoor: true },
  });
  sendSuccess(res, activities);
}));

// GET /search/hidden-gems — AI-powered (returns from cities db for now, AI enhanced when key provided)
router.get('/hidden-gems', asyncHandler(async (req, res) => {
  const { city } = req.query;
  const cities = await prisma.city.findMany({
    where: { popularity: { lt: 80 }, ...(city && { name: { contains: city, mode: 'insensitive' } }) },
    orderBy: { popularity: 'asc' },
    take: 10,
  });
  sendSuccess(res, cities);
}));

module.exports = router;
