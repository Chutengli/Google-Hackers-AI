import express from "express";
import { fetchGenerativeContent, countTokens } from "./services/fetchLLM.js";
import { ChatClient } from "./services/ChatClient.js";

const app = express();
app.use(express.json());
const PORT = 3001;

const chatClient = new ChatClient();
try {
  await chatClient.connect();
} catch (error) {
  console.error(error);
}

app.post("/fetch-content", async (req, res) => {
  // get the chat data from the request
  const { chatData } = req.body;
  try {
    const data = await fetchGenerativeContent(chatData);
    const tokenCounts = await countTokens(chatData);
    res.json({ data, tokenCounts });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Error fetching content" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
