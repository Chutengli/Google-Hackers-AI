import { StreamChat } from "stream-chat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const serverClient = StreamChat.getInstance(
  process.env.CHAT_API_KEY,
  process.env.CHAT_API_TOKEN
);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const usersInfo = JSON.parse(
  fs.readFileSync(path.resolve(dirname, "./data/users.json"), "utf8")
);
console.log(usersInfo);
try {
  console.log("Creating users...");
  const updateResponse = await serverClient.upsertUsers(usersInfo);

  console.log("updateResponse: ", updateResponse);
  console.log("Done creating users.");

  console.log("Creatieng user tokens...");

  const userInfoWithToken = await Promise.all(
    usersInfo.map(async (user) => {
      const token = await serverClient.createToken(user.id);
      return { ...user, token };
    })
  );
  console.log(userInfoWithToken);
  // write the new user info with token to ./data/users.json
  fs.writeFileSync(
    path.resolve(dirname, "./data/users.json"),
    JSON.stringify(userInfoWithToken, null, 2)
  );
  console.log("Done creating user tokens.");
} catch (error) {
  console.error(error);
  process.exit(1);
}

/* Example output:
[
  {
    id: 'userA',
    role: 'user',
    jobTitle: 'Project Manager',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckEifQ.DRWFdAdupTNi6z1fV1uULIAFd6cJ2WSBRuLS0b72svk'
  },
  {
    id: 'userB',
    role: 'user',
    jobTitle: 'Front-end Developer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckIifQ.Gqg10cN8hz4dIbug6jBhecY9FfjwnUx33EZONrUXKOE'
  },
  {
    id: 'userC',
    role: 'user',
    jobTitle: 'Back-end Developer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckMifQ.vP-Gl3NOxyOIUBE8ptf8kAX8t9_zY085nJ4KUcgUKRM'
  },
  {
    id: 'userD',
    role: 'user',
    jobTitle: 'Full stack Developer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckQifQ.XJiWq8SlO7SmeBCM9xsdiXG8oHVbLJjJ-hyD7Me9DwA'
  },
  {
    id: 'userE',
    role: 'user',
    jobTitle: 'Quality Assurance Engineer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckUifQ.BNVabZC8-q_5LLRe3gj946ZFTvlYKtGu7X5FKed02lw'
  },
  {
    id: 'userF',
    role: 'user',
    jobTitle: 'UI/UX Designer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlckYifQ.BOXZ3DkCtt8-9JmdF31pR1gPaKeU4E5QJewNLyzCFsI'
  }
]
*/
