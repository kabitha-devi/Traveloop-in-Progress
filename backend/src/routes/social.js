const router = require('express').Router();
const prisma = require('../utils/prisma');
const { sendSuccess, asyncHandler } = require('../utils/response');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// GET /social/feed — public itineraries
router.get('/feed', optionalAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, region } = req.query;
  const posts = await prisma.socialPost.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
    include: {
      user: { select: { id: true, firstName: true, lastName: true, photo: true } },
      trip: {
        select: {
          id: true, name: true, description: true, coverPhoto: true, startDate: true, endDate: true,
          stops: { select: { cityName: true }, take: 5 },
          _count: { select: { stops: true } },
        },
      },
    },
  });
  sendSuccess(res, posts);
}));

// POST /social/posts — publish trip
router.post('/posts', authMiddleware, asyncHandler(async (req, res) => {
  const { tripId, caption } = req.body;
  await prisma.trip.update({ where: { id: tripId }, data: { isPublic: true } });
  const post = await prisma.socialPost.create({
    data: { userId: req.user.id, tripId, caption },
    include: { trip: { select: { id: true, name: true, coverPhoto: true } } },
  });
  sendSuccess(res, post, 201);
}));

// GET /social/trending
router.get('/trending', asyncHandler(async (req, res) => {
  const trendingCities = await prisma.city.findMany({ orderBy: { popularity: 'desc' }, take: 10 });
  const trendingPosts = await prisma.socialPost.findMany({
    where: { isPublic: true },
    orderBy: { likes: 'desc' },
    take: 5,
    include: {
      user: { select: { firstName: true, lastName: true, photo: true } },
      trip: { select: { name: true, coverPhoto: true } },
    },
  });
  sendSuccess(res, { cities: trendingCities, posts: trendingPosts });
}));

// POST /social/posts/:id/like
router.post('/posts/:id/like', authMiddleware, asyncHandler(async (req, res) => {
  const post = await prisma.socialPost.update({
    where: { id: req.params.id },
    data: { likes: { increment: 1 } },
  });
  sendSuccess(res, post);
}));

// POST /social/posts/:id/fork
router.post('/posts/:id/fork', authMiddleware, asyncHandler(async (req, res) => {
  const post = await prisma.socialPost.findUnique({ where: { id: req.params.id } });
  if (!post) return sendError(res, 'Post not found', 404);

  // Reuse trip fork logic
  const original = await prisma.trip.findUnique({
    where: { id: post.tripId },
    include: { stops: { include: { activities: true } } },
  });

  const forked = await prisma.trip.create({
    data: {
      userId: req.user.id,
      name: `${original.name} (forked)`,
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      totalBudget: original.totalBudget,
      coverPhoto: original.coverPhoto,
      source: 'forked',
      forkedFromId: original.id,
      stops: {
        create: original.stops.map((stop, i) => ({
          cityName: stop.cityName, country: stop.country, startDate: stop.startDate, endDate: stop.endDate,
          budget: stop.budget, position: i,
          activities: { create: stop.activities.map((a, j) => ({ name: a.name, category: a.category, cost: a.cost, duration: a.duration, position: j })) },
        })),
      },
    },
  });

  await prisma.socialPost.update({ where: { id: req.params.id }, data: { forks: { increment: 1 } } });
  sendSuccess(res, forked, 201);
}));

module.exports = router;
