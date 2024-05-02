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

// text is thw conversation and ticketBoard is the ticketBoard
async function fetchGenerativeContent(text, ticketBoard) {
  // Convert ticketBoard into a summarized JSON string for input
  const ticketSummary = JSON.stringify({ projects: ticketBoard });

  const prompt = `As a project management master, update the ticket progress board: ${ticketSummary} by analyzing and summarizing the following conversation: ${text}. Keep JSON format like this "
  [
    {
      "channel": "[channel name]",
      "task_id": "[assign one for new tasks using both letter and number]",
      "task_content": "[Content]",
      "status": "[To Do/In Progress/Done]",
      "deadline": "[Updated or Confirmed Deadline]",
      "assignee": "[Member Name if assigned]",
      "details": "[Details]",
      "progress": "[Progress Percentage]",
      "updates": "[latest progress update for existing tasks, keep previous progress record]"
    },...
  ]
  "
  . Be sure to match the tasks and projects.`;

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
    // to do: rerun if undefined
    console.log("Received Response: ", response.candidates[0].content.parts[0].text)
    const parsedResponse = parseJSONFromText(response.candidates[0].content.parts[0].text);
    
    return parsedResponse;
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
    const jsonMatch = text.match(/\[\s*\{[^[]*?\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in the text.");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON from text:", error);
    throw new Error("Failed to parse JSON.");
  }
};


export { fetchGenerativeContent, countTokens };
