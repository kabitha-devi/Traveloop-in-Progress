const router = require('express').Router();
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { validate, createTripSchema } = require('../validators/schemas');

router.use(authMiddleware);

// GET /trips — paginated list, filter by status
router.get('/', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    userId: req.user.id,
    deletedAt: null,
    ...(status && { status: status.toUpperCase() }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { startDate: 'desc' },
      include: { stops: { select: { id: true, cityName: true }, orderBy: { position: 'asc' } }, _count: { select: { stops: true, notes: true } } },
    }),
    prisma.trip.count({ where }),
  ]);

  sendSuccess(res, trips, 200, { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
}));

// POST /trips — create
router.post('/', validate(createTripSchema), asyncHandler(async (req, res) => {
  const trip = await prisma.trip.create({
    data: {
      ...req.validatedBody,
      startDate: new Date(req.validatedBody.startDate),
      endDate: new Date(req.validatedBody.endDate),
      userId: req.user.id,
    },
    include: { stops: true },
  });

  // Auto-create owner as group member
  await prisma.groupMember.create({
    data: { tripId: trip.id, userId: req.user.id, role: 'OWNER' },
  });

  sendSuccess(res, trip, 201);
}));

// GET /trips/:id — full trip with stops + activities
router.get('/:id', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: {
      stops: {
        orderBy: { position: 'asc' },
        include: { activities: { orderBy: { position: 'asc' } }, weather: true, expenses: true },
      },
      invoice: { include: { items: true } },
      checklist: { orderBy: { category: 'asc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      groupMembers: { include: { user: { select: { id: true, firstName: true, lastName: true, photo: true } } } },
      personality: true,
      journal: { include: { highlights: true } },
      _count: { select: { stops: true, notes: true, memoryPins: true } },
    },
  });

  if (!trip) return sendError(res, 'Trip not found', 404);
  sendSuccess(res, trip);
}));

// PUT /trips/:id — update
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate, totalBudget, coverPhoto, mood, status } = req.body;
  const trip = await prisma.trip.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(totalBudget !== undefined && { totalBudget }),
      ...(coverPhoto && { coverPhoto }),
      ...(mood && { mood }),
      ...(status && { status: status.toUpperCase() }),
    },
    include: { stops: true },
  });
  sendSuccess(res, trip);
}));

// DELETE /trips/:id — soft delete
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.trip.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  sendSuccess(res, { message: 'Trip deleted' });
}));

// POST /trips/:id/publish — make public
router.post('/:id/publish', asyncHandler(async (req, res) => {
  const trip = await prisma.trip.update({
    where: { id: req.params.id },
    data: { isPublic: true },
  });
  sendSuccess(res, trip);
}));

// POST /trips/:id/fork — copy trip to current user
router.post('/:id/fork', asyncHandler(async (req, res) => {
  const original = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: { stops: { include: { activities: true } } },
  });
  if (!original) return sendError(res, 'Trip not found', 404);

  const forked = await prisma.trip.create({
    data: {
      userId: req.user.id,
      name: `${original.name} (copy)`,
      description: original.description,
      startDate: original.startDate,
      endDate: original.endDate,
      totalBudget: original.totalBudget,
      coverPhoto: original.coverPhoto,
      mood: original.mood,
      source: 'forked',
      forkedFromId: original.id,
      stops: {
        create: original.stops.map((stop, i) => ({
          cityName: stop.cityName,
          country: stop.country,
          lat: stop.lat,
          lng: stop.lng,
          startDate: stop.startDate,
          endDate: stop.endDate,
          budget: stop.budget,
          position: i,
          activities: {
            create: stop.activities.map((a, j) => ({
              name: a.name, category: a.category, description: a.description,
              cost: a.cost, duration: a.duration, isIndoor: a.isIndoor, position: j,
            })),
          },
        })),
      },
    },
    include: { stops: { include: { activities: true } } },
  });

  sendSuccess(res, forked, 201);
}));

// GET /trips/:id/invoice — generate invoice data
router.get('/:id/invoice', asyncHandler(async (req, res) => {
  let invoice = await prisma.invoice.findUnique({
    where: { tripId: req.params.id },
    include: { items: true },
  });

  if (!invoice) {
    // Auto-generate from stops + activities
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { stops: { include: { activities: true, expenses: true } } },
    });
    if (!trip) return sendError(res, 'Trip not found', 404);

    const items = [];
    for (const stop of trip.stops) {
      for (const activity of stop.activities) {
        items.push({ category: activity.category || 'Activity', description: `${activity.name} — ${stop.cityName}`, qty: '1', unitCost: activity.cost, amount: activity.cost });
      }
      for (const expense of stop.expenses) {
        items.push({ category: expense.category, description: expense.description || expense.category, qty: '1', unitCost: expense.amount, amount: expense.amount });
      }
    }

    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const tax = subtotal * 0.05;
    invoice = await prisma.invoice.create({
      data: {
        tripId: trip.id, subtotal, tax, discount: 0, grandTotal: subtotal + tax,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  sendSuccess(res, invoice);
}));

module.exports = router;
