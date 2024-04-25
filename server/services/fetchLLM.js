import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1000,
  response_mime_type: "text/plain",
};

async function fetchGenerativeContent(text, projectQueue) {
  // Convert projectQueue into a summarized JSON string for input
  const projectSummary = JSON.stringify({ projects: projectQueue });

  const prompt = `As a project management master, analyze and summarize the following conversation: ${text}. Given the current project progress summary: ${projectSummary}. Keep json format like this "
  {
    "projects": [
      {
        "project_name": "[Project Name]",
        "project_id": "[Project ID]",
        "tasks": [
          {
            "task_id": "[null if not mentioned]",
            "task_content": "[Content]",
            "status": "[To do/Doing/Done]",
            "deadline": "[Updated or Confirmed Deadline]",
            "assignee": "[Member Name if assigned]",
            "details": "[Details]"
          },...
        ]
      },...
    ]
  }". Be sure to match the tasks and projects.`;

  try {
    // This part is constructed with the complete prompt
    const parts = [{ text: prompt }]; // Changed to use the constructed prompt

    console.log("Sending to model:", parts); // Verify what is sent to the model

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: {
        parts, // parts array now contains the correct prompt
        role: "model",
      },
      generationConfig,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }], // Send the correct parts to the content generation
    });

    if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
      return {
        error: `Blocked for ${result.response.promptFeedback.blockReason}`,
      };
    }

    const response = await result.response;
    return response.candidates[0].content.parts[0].text;
  } catch (e) {
    console.error("Error fetching content:", e);
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

const parseJSONFromText = (text) => {
  if (typeof text !== 'string') {
    console.error("Invalid input: Expected a string, received:", typeof text);
    throw new Error("Input must be a string to parse JSON.");
  }
  
  try {
    const jsonMatch = text.match(/\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in the text.");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON from text:", error);
    throw new Error("Failed to parse JSON.");
  }
};


// Usage in the processMessages function to parse the API response
async function processMessages(messageQueue, projectQueue) {
  const combinedText = messageQueue.join(' ');
  try {
    const responseData = await fetchGenerativeContent(combinedText, projectQueue);
    const parsedData = parseJSONFromText(responseData);
    return parsedData; // Return the parsed data so it can be sent to the client
  } catch (error) {
    console.error("Failed to process or parse messages from API:", error);
    return { error: error.message };
  }
}


export { fetchGenerativeContent, countTokens , processMessages };
