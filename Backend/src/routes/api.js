import express from 'express';
import { apiLimiter } from '../middleware/rateLimit.js';
import { Cache } from '../db/models/Cache.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/process', apiLimiter, async (req, res, next) => {
  try {
    const { text, action } = req.body;
    
    if (!text || !action) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["text", "action"]
      });
    }
    const cacheKey = crypto.createHash('md5')
      .update(`${action}:${text}`)
      .digest('hex');

    const cached = await Cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        data: cached.value
      });
    }

    const response = await fetch(`${process.env.API_URL}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Action': action
      },
      body: JSON.stringify({ text, action }),
      timeout: 90000
    });

    if (!response.ok) throw new Error(await response.text());
    
    const data = await response.json();
    
    await Cache.set(cacheKey, data.response);

    res.json({
      success: true,
      cached: false,
      data: data.response
    });

  } catch (error) {
    next(error);
  }
});

export default router;
