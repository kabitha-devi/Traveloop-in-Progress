const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { sendSuccess, sendError, asyncHandler } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuid } = require('uuid');

router.use(authMiddleware);

// POST /groups/:tripId/invite
router.post('/invite', asyncHandler(async (req, res) => {
  const { email, role = 'VIEWER' } = req.body;
  const invite = await prisma.tripInvite.create({
    data: {
      tripId: req.params.tripId,
      email,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  // TODO: Send email with invite link when SMTP configured
  sendSuccess(res, { inviteToken: invite.token, inviteUrl: `${process.env.FRONTEND_URL}/invite/${invite.token}` }, 201);
}));

// POST /groups/:tripId/join
router.post('/join', asyncHandler(async (req, res) => {
  const { token } = req.body;
  const invite = await prisma.tripInvite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return sendError(res, 'Invalid or expired invite', 400);
  }

  const existing = await prisma.groupMember.findUnique({
    where: { tripId_userId: { tripId: invite.tripId, userId: req.user.id } },
  });
  if (existing) return sendError(res, 'Already a member', 409);

  const member = await prisma.groupMember.create({
    data: { tripId: invite.tripId, userId: req.user.id, role: invite.role },
  });
  await prisma.tripInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });

  sendSuccess(res, member, 201);
}));

// POST /groups/:tripId/propose
router.post('/propose', asyncHandler(async (req, res) => {
  const { type, name, description, category, cost, duration } = req.body;
  // Store proposal as a vote target
  const proposalId = uuid();
  const vote = await prisma.vote.create({
    data: { tripId: req.params.tripId, userId: req.user.id, proposalId, value: 1 },
  });
  // Store proposal details in notification for now
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      type: 'proposal',
      title: `New proposal: ${name}`,
      body: description,
      data: { proposalId, type, name, description, category, cost, duration, tripId: req.params.tripId },
    },
  });
  sendSuccess(res, { proposalId, vote }, 201);
}));

// POST /groups/:tripId/vote
router.post('/vote', asyncHandler(async (req, res) => {
  const { proposalId, value } = req.body; // value: 1 or -1
  const vote = await prisma.vote.upsert({
    where: { userId_proposalId: { userId: req.user.id, proposalId } },
    create: { tripId: req.params.tripId, userId: req.user.id, proposalId, value },
    update: { value },
  });
  sendSuccess(res, vote);
}));

// GET /groups/:tripId/consensus
router.get('/consensus', asyncHandler(async (req, res) => {
  const votes = await prisma.vote.findMany({
    where: { tripId: req.params.tripId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  const proposals = {};
  votes.forEach(v => {
    if (!proposals[v.proposalId]) proposals[v.proposalId] = { up: 0, down: 0, total: 0 };
    if (v.value > 0) proposals[v.proposalId].up++;
    else proposals[v.proposalId].down++;
    proposals[v.proposalId].total++;
  });

  const ranked = Object.entries(proposals)
    .map(([id, scores]) => ({ proposalId: id, score: (scores.up - scores.down) / Math.max(scores.total, 1), ...scores }))
    .sort((a, b) => b.score - a.score);

  sendSuccess(res, { proposals: ranked, totalVoters: new Set(votes.map(v => v.userId)).size });
}));

// GET /groups/:tripId/members
router.get('/members', asyncHandler(async (req, res) => {
  const members = await prisma.groupMember.findMany({
    where: { tripId: req.params.tripId },
    include: { user: { select: { id: true, firstName: true, lastName: true, photo: true, email: true } } },
  });
  sendSuccess(res, members);
}));

module.exports = router;
