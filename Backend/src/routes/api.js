import express from 'express';
import { apiLimiter } from '../middleware/rateLimit.js'; // fixed filename
import { Cache } from '../db/models/Cache.js';
import crypto from 'crypto';

const router = express.Router();

// Cache Middleware
const checkCache = async (req, res, next) => {
  try {
    const { text, action } = req.body;
    const cacheKey = `mistral:${action}:${crypto
      .createHash('md5')
      .update(text)
      .digest('hex')}`;

    const cached = await Cache.findOne({ key: cacheKey });

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        action,
        data: cached.value
      });
    } else {
      req.cacheKey = cacheKey;
      next();
    }
  } catch (error) {
    next(error);
  }
};

// POST /process
router.post('/process', apiLimiter, checkCache, async (req, res, next) => {
  try {
    const { text, action } = req.body;

    const response = await fetch(`${process.env.API_URL}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Action-Type': action
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: text,
        action
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();

    if (data.success) {
      await Cache.create({
        key: req.cacheKey,
        value: data.response,
        expiresAt: new Date(Date.now() + 3600000) // ✅ 1 hour TTL correctly saved
      });
    }

    res.json({
      success: true,
      cached: false,
      action,
      data: data.response
    });

  } catch (error) {
    next(error);
  }
});

export default router;
