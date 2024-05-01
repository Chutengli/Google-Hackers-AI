import express from "express";
import { fetchGenerativeContent, countTokens } from "./services/fetchLLM.js";
import { ChatClient } from "./services/ChatClient.js";

const app = express();
app.use(express.json());
const PORT = 3001;

const chatClient = new ChatClient();
try {
  await chatClient.connect();
  await chatClient.watchAllChannels();
} catch (error) {
  console.error(error);
}

// TODO: /command function
// TODO: /Gemni API return action, programmatically chatbot send message

// TODO: util create channel with conversation & user
const ticketBoard = [
  {
    task_id: null,
    task_content: "Set up server",
    status: "Done",
    deadline: null,
    assignee: "B",
    details: "Back-end server is successfully set up.",
    progress: "100%",
  },
  {
    task_id: null,
    task_content: "Develop user management APIs",
    status: "Doing",
    deadline: null,
    assignee: "B",
    details: "Coding of basic user management APIs has begun.",
    progress: "0%",
  },
  {
    task_id: null,
    task_content: "Sync on data needs for front-end forms",
    status: "To do",
    deadline: null,
    assignee: "B",
    details:
      "B needs to discuss data requirements with E for designing front-end forms.",
    progress: "10%",
  },
  {
    task_id: null,
    task_content: "Draft initial wireframes for the application",
    status: "To do",
    deadline: null,
    assignee: "E",
    details:
      "E will create initial wireframes and share with B and D for feedback.",
    progress: "50%",
  },
  {
    task_id: null,
    task_content: "Review and provide feedback on wireframes",
    status: "To do",
    deadline: null,
    assignee: "B",
    details: "B and D need to review wireframes and provide feedback to E.",
    progress: "50%",
  },
];

app.post("/fetch-content", async (req, res) => {
  // get the chat data from the request
  const { chatData } = req.body;
  try {
    const data = await fetchGenerativeContent(chatData, ticketBoard);
    const tokenCounts = await countTokens(chatData);
    res.json({ data, tokenCounts });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Error fetching content" });
  }
});

app.use("/ping", (req, res) => {
  res.send("hello world~");
  console.log("pinged");
});

app.post("/update", async (req, res) => {
  const { message } = req.body;
  const channel = chatClient.client.channel("messaging", "ui");
  await channel.sendMessage({
    text: "received your request!",
  });
  res.status(200).json({
    message: {
      text: `${message?.text}`,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
