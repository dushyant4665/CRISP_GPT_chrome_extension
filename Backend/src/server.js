import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';
import { Cache } from './db/models/Cache.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 8000;


app.set('trust proxy', true);
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5174", "http://127.0.0.1:5500"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(apiLimiter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info("✅ MongoDB Connected"))
  .catch((err) => logger.error("❌ MongoDB Error:", err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("🔹 Gemini Instance Ready:", genAI instanceof GoogleGenerativeAI);

app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
  res.send("✅ Backend is running");
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});


app.post("/api/mistral", async (req, res) => {
  const { prompt: action, text, model = "mistral" } = req.body;
  console.log("🔍 Received request body:", { text, prompt: action, model });

  try {
    if (!action || !text) {
      return res.status(400).json({
        error: "Missing required fields: prompt/text",
        valid_prompts: ["explain", "expand", "summarize"],
      });
    }

    const key = `${model}:${action}:${text}`;
    const hashedKey = hashString(key);

    const cached = await Cache.findOne({ key: hashedKey });
    if (cached) {
      console.log("⚡ Served from cache");
      return res.json({
        success: true,
        prompt: action,
        response: cached.value,
      });
    }

    let prompt;
    switch (action) {
      case "summarize":
        prompt = `Please summarize the following text:\n\n${text}`;
        break;
      case "explain":
        prompt = `Explain the following in simple terms:\n\n${text}`;
        break;
      case "expand":
        prompt = `Expand on the following:\n\n${text}`;
        break;
      default:
        return res.status(400).json({
          error: "Invalid prompt",
          valid_prompts: ["explain", "expand", "summarize"],
        });
    }

    const response = await axios.post(`${process.env.OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false,
    });

    await Cache.create({ key: hashedKey, value: response.data.response });

    res.json({
      success: true,
      prompt: action,
      response: response.data.response,
    });
  } catch (error) {
    console.error("❌ Mistral Error:", error);
    res.status(500).json({
      error: error.message,
      prompt: action,
    });
  }
});

app.use(errorHandler);


console.log("🔍 Env Vars:", {
  OPENAI: !!process.env.OPENAI_API_KEY,
  GEMINI: !!process.env.GEMINI_API_KEY,
  OLLAMA: !!process.env.OLLAMA_API_URL,
});


const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close();
    logger.info("🛑 Server & DB closed");
    process.exit(0);
  });
});


function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}