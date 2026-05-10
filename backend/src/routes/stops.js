const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { validate, createStopSchema } = require('../validators/schemas');

router.use(authMiddleware);

// GET /trips/:tripId/stops
router.get('/', asyncHandler(async (req, res) => {
  const stops = await prisma.stop.findMany({
    where: { tripId: req.params.tripId },
    orderBy: { position: 'asc' },
    include: {
      activities: { orderBy: { position: 'asc' } },
      weather: true,
      expenses: true,
      _count: { select: { activities: true, notes: true } },
    },
  });
  sendSuccess(res, stops);
}));

// POST /trips/:tripId/stops
router.post('/', validate(createStopSchema), asyncHandler(async (req, res) => {
  const maxPos = await prisma.stop.aggregate({ where: { tripId: req.params.tripId }, _max: { position: true } });
  const stop = await prisma.stop.create({
    data: {
      ...req.validatedBody,
      startDate: new Date(req.validatedBody.startDate),
      endDate: new Date(req.validatedBody.endDate),
      tripId: req.params.tripId,
      position: (maxPos._max.position ?? -1) + 1,
    },
    include: { activities: true },
  });
  sendSuccess(res, stop, 201);
}));

// PUT /stops/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { cityName, country, lat, lng, startDate, endDate, budget, description } = req.body;
  const stop = await prisma.stop.update({
    where: { id: req.params.id },
    data: {
      ...(cityName && { cityName }),
      ...(country !== undefined && { country }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(budget !== undefined && { budget }),
      ...(description !== undefined && { description }),
    },
    include: { activities: true },
  });
  sendSuccess(res, stop);
}));

// DELETE /stops/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.stop.delete({ where: { id: req.params.id } });
  sendSuccess(res, { message: 'Stop deleted' });
}));

// PATCH /trips/:tripId/stops/reorder
router.patch('/reorder', asyncHandler(async (req, res) => {
  const { order } = req.body; // [{ id, position }]
  if (!Array.isArray(order)) return sendError(res, 'order must be an array', 400);

  await prisma.$transaction(
    order.map(({ id, position }) =>
      prisma.stop.update({ where: { id }, data: { position } })
    )
  );

  const stops = await prisma.stop.findMany({
    where: { tripId: req.params.tripId },
    orderBy: { position: 'asc' },
    include: { activities: true },
  });
  sendSuccess(res, stops);
}));

module.exports = router;
