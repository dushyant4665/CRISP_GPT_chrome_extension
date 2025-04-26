import sslRootCAs from 'ssl-root-cas';
sslRootCAs.inject().addFile('./rds-combined-ca-bundle.pem');

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import { Cache } from './db/models/Cache.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT || 8000;


const MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 100000,
  socketTimeoutMS: 50000,
  connectTimeoutMS: 90000,
  retryWrites: true,
  w: 'majority',
  tls: true
};


if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); 
}

app.use(express.json());
app.use(cors({
  origin: [
     "https://crispgptchromeextension-production.up.railway.app",
    "http://localhost:5174", 
    "http://127.0.0.1:5500",
    "chrome-extension://*"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(apiLimiter);


const MAX_RETRIES = 5;
let connectionRetries = 0;

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, MONGODB_OPTIONS);
    logger.info('✅ MongoDB Connected Successfully');
    connectionRetries = 0;
  } catch (err) {
    connectionRetries++;
    logger.error(`❌ MongoDB Connection Failed (Attempt ${connectionRetries}): ${err.message}`);
    
    if(connectionRetries < MAX_RETRIES) {
      const retryDelay = Math.pow(2, connectionRetries) * 1000;
      logger.info(`⌛ Retrying in ${retryDelay/1000} seconds...`);
      setTimeout(connectWithRetry, retryDelay);
    } else {
      logger.error('💥 Maximum Connection Retries Reached!');
      process.exit(1);
    }
  }
};

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'users', 
});

mongoose.connection.on('connected', () => {
  logger.info('📊 MongoDB Event: Connected');
  Cache.createIndexes().catch(err => logger.error('Index creation error:', err));
});

mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB Event: Disconnected'));
mongoose.connection.on('reconnected', () => logger.info('♻️ MongoDB Event: Reconnected'));
mongoose.connection.on('error', (err) => logger.error(`❌ MongoDB Event Error: ${err.message}`));

connectWithRetry();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
logger.info(`🔹 Gemini AI Initialized: ${genAI instanceof GoogleGenerativeAI}`);


app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'active',
    version: '1.6.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      ai: 'operational'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});


app.post("/api/mistral", async (req, res) => {
  try {
    const { action, text } = req.body;
    
    if (!action || !text) {
      return res.status(400).json({
        error: "Invalid Request",
        details: "Missing parameters",
        valid_actions: ["explain", "expand", "summarize"]
      });
    }

    const cacheKey = crypto.createHash('md5').update(`${action}:${text}`).digest('hex');
    
    const cached = await Cache.findOne({ key: cacheKey }).lean();
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        response: cached.value
      });
    }

    const response = await axios.post(
      `${process.env.OLLAMA_API_URL}/api/generate`,
      {
        model: "mistral",
        prompt: `${action}: ${text}`,
        stream: false
      },
      { timeout: 30000 }
    );

    await Cache.create({
      key: cacheKey,
      value: response.data.response,
      expiresAt: new Date(Date.now() + 3600000)
    });

    res.json({
      success: true,
      cached: false,
      response: response.data.response
    });

  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;
    
    logger.error(`❌ Mistral Error [${statusCode}]: ${errorMessage}`);
    res.status(statusCode).json({
      error: errorMessage,
      action: req.body.action,
      suggestion: statusCode === 401 ? 'Check credentials' : 'Retry later'
    });
  }
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server Operational: Port ${PORT}`);
});

const shutdownSequence = async () => {
  logger.info('🛑 Initiating Shutdown...');
  try {
    await server.close();
    await mongoose.connection.close();
    logger.info('🛑 System Stopped');
    process.exit(0);
  } catch (err) {
    logger.error('💥 Force Shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdownSequence);
process.on('SIGINT', shutdownSequence);
