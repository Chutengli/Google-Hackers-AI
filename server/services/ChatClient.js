import { StreamChat } from "stream-chat";
import { fetchGenerativeContent } from "./fetchLLM.js";
import { updateValues , clearRange} from "./googlesheet/index.js";

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
    const { message, user , channel_id} = event;
    const createdAt = new Date(message.created_at).toLocaleString(); // Converts the UTC date-time to a more readable local date-time string
    const jobTitle = user.jobTitle || 'User'; // Fallback to 'User' if jobTitle is not available
    const userId = user.id;
    const text = message.text;
    
    return `At ${createdAt}, ${jobTitle}, ${userId} said '${text}' in '${channel_id}'`;
  }

  convertTicketBoardToText(task) {
    return `**Task ID**: ${task.task_id}\n**Task Content**: ${task.task_content}\n**Status**: ${task.status}\n**Assignee**: ${task.assignee}\n**Details**: ${task.details}\n**Progress**: ${task.progress}\n**Updates**: ${task.updates}\n`;
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
      console.log(this.ticketBoard)
      for (const ticket of this.ticketBoard) {
        const channel = this.client.channel("messaging", ticket.channel);
        const formattedText = this.convertTicketBoardToText(ticket);
        console.log("Sending message:", formattedText);
        await channel.sendMessage({
          text: formattedText,
        });
      }
      const today = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const transformedTasks = this.ticketBoard.map(task => [
        today,
        task.channel,
        task.task_id,
        task.task_content,
        task.status,
        task.deadline,
        task.assignee,
        task.details,
        task.progress,
        task.updates
      ]);
      clearRange(
        "1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw", // sheet id example: 1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8 in url: https://docs.google.com/spreadsheets/d/1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8/edit#gid=0
        "Congregated!B4:K50"
      ).then(() => {
        updateValues(
          "1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw", // sheet id example: 1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8 in url: https://docs.google.com/spreadsheets/d/1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8/edit#gid=0
          "Congregated!B4", // Top Left cell of Range
          "RAW",
          transformedTasks
        )
      });


      // Define a dictionary to map channels to Google Sheets names
      const channelToSheetMap = {
        ui: "Design",
        eng: "Engineering",
        // Add more mappings as needed
      };

      // Function to update tasks based on channel
      function updateTasksByChannel(ticketBoard) {
        // Iterate over each entry in the channel-to-sheet mapping
        const today = new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
        Object.entries(channelToSheetMap).forEach(([channel, sheetName]) => {
          // Filter tasks that match the current channel
          console.log(channel)
          const tasksForChannel = ticketBoard.filter(task => task.channel === channel).map(task => [
            today,
            task.channel,
            task.task_id,
            task.task_content,
            task.status,
            task.deadline,
            task.assignee,
            task.details,
            task.progress,
            task.updates
          ]);

          // If there are tasks for this channel, update the corresponding sheet
          if (tasksForChannel.length > 0) {
            const rangeStart = `${sheetName}!B4`; // Adjust the range start as necessary
            const rangeClear = `${sheetName}!B4:K50`; // Adjust the range start as necessary
            clearRange(
              "1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw", // sheet id example: 1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8 in url: https://docs.google.com/spreadsheets/d/1Ktxkmr5FHGbMzfjSmQGLcgjxxBBEmENLOBVVsWojWp8/edit#gid=0
              rangeClear
            ).then(() => {
              updateValues(
                "1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw", // Example sheet id
                rangeStart,
                "RAW",
                tasksForChannel
              )
            });
          }
        });
      }

      updateTasksByChannel(this.ticketBoard);

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
