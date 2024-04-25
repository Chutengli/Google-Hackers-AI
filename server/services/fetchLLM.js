import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 200,
  response_mime_type: "text/plain",
};

const prompt = `
You are a scrum master for the team. Your task is to generate ations types, time and description for team base on the group chat. 

Your response must be a JSON object which has the following schema:

* actionTyle: Type of the actions it will perform from three optoins: "Create", "Update", "Delete"
* time: The time it will take to perform the action
* descroption: A brief reason for why the user would like this book
`;

// Fetches generative content from the model, text only.
async function fetchGenerativeContent(text) {
  try {
    const parts = [{ text }];
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: {
        parts: [{ text: prompt }],
        role: "model",
      },
      generationConfig,
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    if (
      result.response.promptFeedback &&
      result.response.promptFeedback.blockReason
    ) {
      return {
        error: `Blocked for ${result.response.promptFeedback.blockReason}`,
      };
    }
    const response = await result.response;
    return response.candidates[0].content.parts[0].text;
  } catch (e) {
    return {
      error: e.message,
    };
  }
}

// return the total tokens in the prompt
async function countTokens(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const { totalTokens } = await model.countTokens(data);
  return totalTokens;
}

export { fetchGenerativeContent, countTokens };
