import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config({ path: './.env' });

export default class AIService {
  constructor() {
    console.log("🔹 Initializing AI Service...");

    // ✅ API Key Validation
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("❌ GEMINI_API_KEY is missing in .env file");
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("🔹 genAI Instance Initialized:", !!this.genAI);
  }

  async generateContent(prompt, text, model = "gemini") {
    try {
        model = model.toLowerCase();
        console.log(`🔹 AI Service Called - Model: ${model}`);

        switch (model) {
          case "gemini":
            return await this._generateWithGemini(prompt, text);

          case "mistral":
          case "mistral:latest":
            return await this._generateWithOllama(prompt, text, "mistral");

          case "llama2":
          case "llama2:latest":
            return await this._generateWithOllama(prompt, text, "llama2");

          default:
            throw new Error(`❌ Invalid or unsupported AI model: ${model}`);
        }
    } catch (error) {
        console.error("❌ AI Error:", error.message);
        return { success: false, error: { code: "AI_ERROR", message: error.message } };
    }
  }

  async _generateWithGemini(prompt, text) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(`${prompt}\n\n${text}`);
      const response = await result.response;

      return {
        success: true,
        text: response.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
        model: 'gemini-pro',
        tokens: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error("❌ Gemini API Error:", error.message);
      throw error;
    }
  }

  async _generateWithOllama(prompt, text, model) {
    try {
        console.log(`🚀 Fetching response from Ollama (${model})...`);

        const response = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            })
        });

        const data = await response.json();

        if (!data.response) {
            throw new Error("No response from Ollama");
        }

        return {
            success: true,
            text: data.response,
            model: model,
            tokens: 0
        };
    } catch (error) {
        console.error("❌ Ollama API Error:", error.message);
        throw error;
    }
  }
}
