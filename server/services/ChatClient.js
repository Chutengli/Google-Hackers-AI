import { StreamChat } from "stream-chat";
import { GeminiService } from "./GeminiService.js";

export class ChatClient {
  client;
  geminiService;

  constructor() {
    this.client = StreamChat.getInstance(process.env.CHAT_API_KEY, {
      allowServerSideConnect: true,
    });

    try {
      this.geminiService = new GeminiService(
        process.env.API_KEY,
        "gemini-1.5-pro-latest"
      );
    } catch (error) {
      console.error(error);
    }
  }

  async connect() {
    if (!process.env.CHAT_APP_USER_ID || !process.env.CHAT_APP_USER_NAME) {
      console.error(
        "Unable to connect to the Chat server without user info. Please make sure you source the .env file."
      );
      return;
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

    this.client.on("message.new", async (event) => {
      // TODO：Feed this into LLM
      if (event.user.id !== process.env.CHAT_APP_USER_ID) {
        console.log("here!");
        await this.geminiService.handleSendMessage({
          user: event?.user,
          message: event?.message,
        });
      }
    });
  }
}
