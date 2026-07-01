const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

class AiService {
  constructor() {
    this.genAI = null;
  }

  getGenAI() {
    if (!this.genAI) {
      const apiKey = config.geminiApiKey;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async generateDescription(title, category) {
    try {
      const genAI = this.getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
      
      const prompt = `Write a premium, engaging, and comprehensive course description for an online course titled "${title}" in the category "${category}". The description should outline what the course is about, key benefits, target audience, and why students should enroll. Make it around 150-200 words. Output ONLY the generated course description as clean plain text paragraphs. DO NOT use any markdown headers (#), bullet points (*), bold markers (**), or any other markdown syntax. Make it look clean inside a simple text area.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Gemini Description Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateSummary(title, content) {
    try {
      const genAI = this.getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
      
      const prompt = `Write a concise summary/description for a lesson titled "${title}" based on the following text content or context: "${content}". Keep it to 2-3 sentences. Output ONLY the generated summary text.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Gemini Summary Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateCustom(prompt) {
    try {
      const genAI = this.getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Gemini Custom Prompt Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}

module.exports = new AiService();
