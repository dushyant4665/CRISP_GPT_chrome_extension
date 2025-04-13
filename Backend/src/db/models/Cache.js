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
    index: { expires: '1h' }
  }
});

// Static methods
cacheSchema.statics = {
  get: async function(key) {
    return this.findOne({ key }).lean().exec();
  }
};

const Cache = mongoose.model('Cache', cacheSchema);

// Create indexes on model registration
Cache.createIndexes();

export { Cache };