import express from 'express';
import { Cache } from '../db/models/Cache.js';

const router = express.Router();

// POST /api/v1/cache
router.post('/', async (req, res) => {
  const { key, value } = req.body;

  try {
    const cache = await Cache.findOneAndUpdate(
      { key },
      { value, expiresAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, cache });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cache/:key
router.get('/:key', async (req, res) => {
  const { key } = req.params;

  try {
    const cache = await Cache.findOne({ key });
    if (!cache) {
      return res.status(404).json({ error: 'Cache not found' });
    }
    res.json({ success: true, cache });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
