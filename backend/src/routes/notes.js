const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { validate, createNoteSchema } = require('../validators/schemas');

router.use(authMiddleware);

// GET /trips/:tripId/notes
router.get('/', asyncHandler(async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { tripId: req.params.tripId },
    orderBy: { createdAt: 'desc' },
    include: { stop: { select: { id: true, cityName: true } } },
  });
  sendSuccess(res, notes);
}));

// POST /trips/:tripId/notes
router.post('/', validate(createNoteSchema), asyncHandler(async (req, res) => {
  const note = await prisma.note.create({
    data: { ...req.validatedBody, tripId: req.params.tripId },
  });
  sendSuccess(res, note, 201);
}));

// PUT /notes/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, body, day, stopId } = req.body;
  const note = await prisma.note.update({
    where: { id: req.params.id },
    data: { ...(title && { title }), ...(body !== undefined && { body }), ...(day !== undefined && { day }), ...(stopId && { stopId }) },
  });
  sendSuccess(res, note);
}));

// DELETE /notes/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.note.delete({ where: { id: req.params.id } });
  sendSuccess(res, { message: 'Note deleted' });
}));

module.exports = router;
