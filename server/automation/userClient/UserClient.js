import { StreamChat } from "stream-chat";

// this is used for exporting users based on the newly created fake users
class UserClient {
  client;

  constructor(userId, userName, userToken) {
    this.client = StreamChat.getInstance(process.env.CHAT_API_KEY, {
      allowServerSideConnect: true,
    });
    this.userId = userId;
    this.userName = userName;
    this.userToken = userToken;
  }

  async connect() {
    if (!this.userId || !this.userName) {
      console.error(
        "Unable to connect to the Chat server without user info. Please make sure you source the .env file."
      );
    }
    await this.client.connectUser(
      {
        id: this.userId,
        name: this.userName,
        image: `https://getstream.io/random_png/?name=${this.userName}`,
      },
      this.userToken
    );
  }
}

// generate each user client based on the fake users info
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const dirname = path.dirname(fileURLToPath(import.meta.url));
const usersInfo = JSON.parse(
  fs.readFileSync(path.resolve(dirname, "./../data/users.json"), "utf8")
);

const UserA = new UserClient(
  usersInfo[0].id,
  usersInfo[0].jobTitle,
  usersInfo[0].token
);

const UserB = new UserClient(
  usersInfo[1].id,
  usersInfo[1].jobTitle,
  usersInfo[1].token
);

const UserC = new UserClient(
  usersInfo[2].id,
  usersInfo[2].jobTitle,
  usersInfo[2].token
);

const UserD = new UserClient(
  usersInfo[3].id,
  usersInfo[3].jobTitle,
  usersInfo[3].token
);

const UserE = new UserClient(
  usersInfo[4].id,
  usersInfo[4].jobTitle,
  usersInfo[4].token
);

const UserF = new UserClient(
  usersInfo[5].id,
  usersInfo[5].jobTitle,
  usersInfo[5].token
);

export { UserA, UserB, UserC, UserD, UserE, UserF, UserClient };
