import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

export const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 40 * 80 * 1000,
  max: process.env.RATE_LIMIT_MAX || 1000,
  message: 'Too many requests, try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const actionLimits = {
  summarize: { windowMs: 60 * 1000, max: 10 },
  explain: { windowMs: 60 * 1000, max: 5 },
  expand: { windowMs: 60 * 1000, max: 3 }
};

export const mistralLimiter = (action) => rateLimit({
  ...actionLimits[action],
  keyGenerator: (req) => req.ip + ':' + action
});
