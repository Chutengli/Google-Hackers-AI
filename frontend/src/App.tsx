import { useEffect } from "react";
import { ChannelFilters, ChannelSort, ChannelOptions, User } from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { EmojiPicker } from "stream-chat-react/emojis";
import "stream-chat-react/dist/css/v2/index.css";

import "./layout.css";

import { init, SearchIndex } from "emoji-mart";
import data from "@emoji-mart/data";

import { CustomMessage } from "./custom-components/CustomMessage";
import { CustomChannelPreview } from "./custom-components/CustomChannelPreview";
import { CustomAttachment } from "./custom-components/CustomAttachment";

const apiKey = process.env.REACT_APP_API_KEY as string;

const userId = process.env.REACT_APP_USER_ID as string;
const userName = process.env.REACT_APP_USER_NAME as string;
const userToken = process.env.REACT_APP_USER_TOKEN;
const user: User = {
  id: userId,
  name: userName,
  image: `https://getstream.io/random_png/?name=${userName}`,
};

const sort: ChannelSort = { last_message_at: -1 };
const filters: ChannelFilters = {
  type: "messaging",
  members: { $in: [userId] },
};
const options: ChannelOptions = {
  limit: 10,
};

init({ data });

const App = () => {
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: userToken,
    userData: user,
  });

  if (!client) return <div>Setting up client & connection...</div>;

  return (
    <Chat client={client} theme="str-chat__theme-custom">
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel EmojiPicker={EmojiPicker} emojiSearchIndex={SearchIndex}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default App;
