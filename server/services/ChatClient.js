import { StreamChat } from "stream-chat";

export class ChatClient {
  client;

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
}
