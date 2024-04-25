import express from "express";
import { fetchGenerativeContent, countTokens ,processMessages } from "./services/fetchLLM.js";

const app = express();
app.use(express.json());
const PORT = 3000;

let messageQueue = [];
let projectQueue = [];
let lastMessageTime = Date.now();

// Set up the interval to check for the 3-minute timeout
setInterval(async () => {  // Changed to async to allow using await inside
  if (Date.now() - lastMessageTime >= 30000 && messageQueue.length > 0) {
    try {
      const response = await processMessages(messageQueue, projectQueue);
      projectQueue.push(response); // Assuming response is to be added to projectQueue
      messageQueue = []; // Clear the message queue
      lastMessageTime = Date.now(); // Reset the timer
      console.log("Updated projectQueue:", projectQueue);
    } catch (error) {
      console.error('Error processing messages:', error);
    }
  }
}, 15000); // Check every 15 seconds


app.post('/fetch-content', async (req, res) => {
  const { name, jobTitle, message } = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const formattedMessage = `At ${timestamp}, ${name}, the ${jobTitle}, says: ${message}.`;
  console.log(formattedMessage);
  
  messageQueue.push(formattedMessage);
  lastMessageTime = Date.now();

  if (messageQueue.length < 30 && (Date.now() - lastMessageTime) < 30000) {
    return res.status(200).json({ message: 'Message received, waiting for more...', projectQueue }); // Returning projectQueue for visibility
  }

  try {
    const result = await processMessages(messageQueue, projectQueue);
    projectQueue.push(result); // Update projectQueue with the response
    messageQueue = []; // Clear the message queue
    lastMessageTime = Date.now(); // Reset the timer
    res.json({ result, projectQueue }); // Send both result and the updated projectQueue
  } catch (error) {
    console.error("Error processing messages:", error);
    res.status(500).json({ error: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
