const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  phone: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email required'),
  password: z.string().min(1, 'Password required'),
});

const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name required'),
  description: z.string().optional(),
  startDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid end date'),
  totalBudget: z.number().min(0).optional().default(0),
  coverPhoto: z.string().optional(),
  mood: z.string().optional(),
});

const createStopSchema = z.object({
  cityName: z.string().min(1, 'City name required'),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid end date'),
  budget: z.number().min(0).optional().default(0),
  description: z.string().optional(),
});

const createActivitySchema = z.object({
  name: z.string().min(1, 'Activity name required'),
  category: z.string().optional(),
  description: z.string().optional(),
  cost: z.number().min(0).optional().default(0),
  duration: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isIndoor: z.boolean().optional().default(false),
});

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title required'),
  body: z.string().optional(),
  stopId: z.string().optional(),
  day: z.number().optional(),
});

const aiTripSchema = z.object({
  query: z.string().min(5, 'Query too short'),
  mood: z.string().optional(),
});

const moodTripSchema = z.object({
  mood: z.enum(['adventure', 'relax', 'romantic', 'healing', 'party', 'spiritual']),
  destination: z.string().optional(),
  budget: z.number().optional(),
  days: z.number().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = result.error;
      err.name = 'ZodError';
      return next(err);
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  registerSchema, loginSchema, createTripSchema, createStopSchema,
  createActivitySchema, createNoteSchema, aiTripSchema, moodTripSchema,
  validate,
};
