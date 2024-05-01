import { StreamChat } from "stream-chat";
import { fetchGenerativeContent } from "./fetchLLM.js";
import { updateValues } from "./googlesheet/index.js";

export class ChatClient {
  client;
  messageCount = 0;
  messageBuffer = [];
  ticketBoard = [];
  timer = null;

  constructor() {
    this.client = StreamChat.getInstance(process.env.CHAT_API_KEY, {
      allowServerSideConnect: true,
    });
  }

  async connect() {
    if (!process.env.CHAT_APP_USER_ID || !process.env.CHAT_APP_USER_NAME) {
      console.error(
        "Unable to connect to the Chat server without user info. Please make sure you source the .env file."
      );
    }
    await this.client.connectUser(
      {
        id: process.env.CHAT_APP_USER_ID,
        name: process.env.CHAT_APP_USER_NAME,
        image: `https://getstream.io/random_png/?name=${process.env.CHAT_APP_USER_NAME}`,
      },
      process.env.CHAT_APP_USER_TOKEN
    );
  }

  async watchAllChannels() {
    const filter = { members: { $in: [process.env.CHAT_APP_USER_ID] } };
    const options = {
      watch: true, // Automatically watches all the channels returned by the query
      state: true, // Get the state of the channel
    };

    const channels = await this.client.queryChannels(filter, {}, options);

    channels.forEach((channel) => {
      console.log(
        `userid: ${process.env.CHAT_APP_USER_ID} Start watching channel ${channel.id}`
      );
    });

    this.client.on("message.new", (event) => {
      // TODO：Feed this into LLM
      if (event.user.id != process.env.CHAT_APP_USER_ID) {
        this.handleNewMessage(event);
      }
    });
  }
  
  handleNewMessage(event) {  
    // Format the message into a human-readable sentence.
    const formattedMessage = this.formatMessage(event);
    
    this.messageBuffer.push(formattedMessage);
    this.messageCount++;

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.processMessages();
    }, 30000); // 30 seconds timeout

    if (this.messageCount >= 20) {
      this.processMessages();
    }
  }

  formatMessage(event) {
    const { message, user } = event;
    const createdAt = new Date(message.created_at).toLocaleString(); // Converts the UTC date-time to a more readable local date-time string
    const jobTitle = user.jobTitle || 'User'; // Fallback to 'User' if jobTitle is not available
    const userId = user.id;
    const text = message.text;
    
    return `At ${createdAt}, ${jobTitle}, ${userId} said '${text}'`;
  }

  convertTicketBoardToText(ticketBoard) {
    return ticketBoard.map(task => {
      return `Task: ${task.task_content}\nStatus: ${task.status}\nAssignee: ${task.assignee}\nDetails: ${task.details}\nProgress: ${task.progress}%\n`;
    }).join('\n');
  }

  async processMessages() {
    // console.log("Processing messages:", this.messageBuffer);
    if (this.messageBuffer.length === 0) {
      console.log("No messages to process.");
      return;
    }
    // Join all formatted messages into a single string, each sentence separated by a new line or space.
    const text = this.messageBuffer.join('\n');
    this.resetMessageTracking();

    try {
      this.ticketBoard = await fetchGenerativeContent(text, this.ticketBoard);
      const formattedText = this.convertTicketBoardToText(this.ticketBoard);
      console.log("Returned messages:", formattedText);
      
      const channel = this.client.channel("messaging", "ui");
      await channel.sendMessage({
        text: formattedText,
      });

      
      const transformedTasks = this.ticketBoard.map(task => [
        task.task_id,
        task.task_content,
        task.status,
        task.deadline,
        task.assignee,
        task.details,
        task.progress
      ]);

      updateValues(
        "1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw", // sheet id example: 1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8 in url: https://docs.google.com/spreadsheets/d/1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8/edit#gid=0
        "To do!C4", // Top Left cell of Range
        "RAW",
        transformedTasks
      );

      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error while processing messages:", error);
    }
  }

  resetMessageTracking() {
    this.messageCount = 0;
    this.messageBuffer = [];
    clearTimeout(this.timer);
    this.timer = null;
  }
}
