const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { validate, createActivitySchema } = require('../validators/schemas');

router.use(authMiddleware);

// GET /stops/:stopId/activities
router.get('/', asyncHandler(async (req, res) => {
  const activities = await prisma.activity.findMany({
    where: { stopId: req.params.stopId },
    orderBy: { position: 'asc' },
  });
  sendSuccess(res, activities);
}));

// POST /stops/:stopId/activities
router.post('/', validate(createActivitySchema), asyncHandler(async (req, res) => {
  const maxPos = await prisma.activity.aggregate({ where: { stopId: req.params.stopId }, _max: { position: true } });
  const data = { ...req.validatedBody, stopId: req.params.stopId, position: (maxPos._max.position ?? -1) + 1 };
  if (data.startTime) data.startTime = new Date(data.startTime);
  if (data.endTime) data.endTime = new Date(data.endTime);

  const activity = await prisma.activity.create({ data });
  sendSuccess(res, activity, 201);
}));

// PUT /activities/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, category, description, cost, duration, startTime, endTime, isIndoor } = req.body;
  const data = {};
  if (name) data.name = name;
  if (category !== undefined) data.category = category;
  if (description !== undefined) data.description = description;
  if (cost !== undefined) data.cost = cost;
  if (duration !== undefined) data.duration = duration;
  if (startTime) data.startTime = new Date(startTime);
  if (endTime) data.endTime = new Date(endTime);
  if (isIndoor !== undefined) data.isIndoor = isIndoor;

  const activity = await prisma.activity.update({ where: { id: req.params.id }, data });
  sendSuccess(res, activity);
}));

// DELETE /activities/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.activity.delete({ where: { id: req.params.id } });
  sendSuccess(res, { message: 'Activity deleted' });
}));

// POST /activities/:id/checkin
router.post('/:id/checkin', asyncHandler(async (req, res) => {
  const activity = await prisma.activity.update({
    where: { id: req.params.id },
    data: { checkedInAt: new Date() },
  });
  sendSuccess(res, activity);
}));

module.exports = router;
