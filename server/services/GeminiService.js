import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  JSONPrompt,
  generationConfig,
  modelStartingChatHistory,
  safetySettings,
} from "../constants.js";

export class GeminiService {
  model;
  chat;

  constructor(apiKey, model) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model });
    this.chat = this.model.startChat({
      generationConfig: generationConfig,
      safetySettings: safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(JSONPrompt) }],
        },
        {
          role: "model",
          parts: [
            {
              text: modelStartingChatHistory,
            },
          ],
        },
      ],
    });
    console.log("Successfully connected to Google Gemini API!");
  }

  async handleSendMessage(messageInfo) {
    try {
      const result = await this.chat.sendMessage(JSON.stringify(messageInfo));
      console.log(JSON.stringify(result));
      return result.response;
    } catch (error) {
      console.error("Gemini Send Message Exception: ", error);
    }
  }
}
