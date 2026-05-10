const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /trips/:tripId/checklist
router.get('/', asyncHandler(async (req, res) => {
  const items = await prisma.checklistItem.findMany({
    where: { tripId: req.params.tripId },
    orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
  });
  const packed = items.filter(i => i.packed).length;
  sendSuccess(res, { items, packed, total: items.length, progress: items.length > 0 ? Math.round((packed / items.length) * 100) : 0 });
}));

// POST /trips/:tripId/checklist/items
router.post('/items', asyncHandler(async (req, res) => {
  const { label, category } = req.body;
  const item = await prisma.checklistItem.create({
    data: { tripId: req.params.tripId, label, category: category || 'General' },
  });
  sendSuccess(res, item, 201);
}));

// PATCH /checklist/items/:id — toggle
router.patch('/items/:id', asyncHandler(async (req, res) => {
  const item = await prisma.checklistItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.checklistItem.update({
    where: { id: req.params.id },
    data: { packed: !item.packed },
  });
  sendSuccess(res, updated);
}));

// DELETE /checklist/items/:id
router.delete('/items/:id', asyncHandler(async (req, res) => {
  await prisma.checklistItem.delete({ where: { id: req.params.id } });
  sendSuccess(res, { message: 'Item deleted' });
}));

module.exports = router;
