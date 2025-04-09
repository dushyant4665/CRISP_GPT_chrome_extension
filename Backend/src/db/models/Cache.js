import mongoose from 'mongoose';

const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    expires: 3600, // TTL: 1 hour
    default: Date.now
  }
});

export const Cache = mongoose.model('Cache', cacheSchema);
