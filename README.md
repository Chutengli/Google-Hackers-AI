# Concerto Plugin

Concerto is a task management plugin that leverages chat history from various workspace channels to generate task actions. These actions include creating new tasks and updating the status of existing tasks. All actions are posted to a "Congregated Channel" for confirmation, ideally through a specific emoji reaction. Once confirmed, the plugin updates the corresponding Google Sheet. [Example of a task management Spreadsheet](https://docs.google.com/spreadsheets/d/1K_mIsrQqBcnR1B8_nhvQngU8UDbvqK9gCbsjkfAERkw/edit?usp=sharing).

## Getting Started

Concerto uses GetStream for chat UI and storage services, and NodeJS for listening/sending to chat content and fetching the Gemini API.

### Prerequisites

- Node v21 (or `nvm use`)
- Enabled Google Workspace API
  - With `credentials.js` and `token.js` in the `./server` directory. See the README in `./server/services/googlesheet/README.md` for more details.
- GetStream
  - Chat API Key
  - Chat API Token
  - User Name and User Token
- Gemini API Key

### Starting the UI

1. Create a `.env` file from `env.sample`. The user in `env.sample` is a bot account created for demo purposes. If the project or user has expired, follow the GetStream tutorials to set up the project and create users.
2. Run `npm i` and `npm run start`.
3. Once the React app is running locally, you can see different channels representing various work groups in the product development organization.

## Starting the Server

1. Create a `.env` file from `env.sample`, and fill the `API_KEY` variable with your Gemini key. Note that the example GetStream information might have expired.
2. Set up your own Workspace account and retrieve the `credentials.js` and `token.js` files from `./server/services/googlesheet` for OAuth consent. [[Instructions on Google Sheet doc](https://developers.google.com/sheets/api/quickstart/nodejs#configure_the_oauth_consent_screen)]
3. In another terminal, run `npm i` and `npm run start`.

## Miscellaneous

### Chat Automation

For demo purposes, we have a series of scripts to automate conversations on the GetStream chat API. This can simulate real conversations within a company, create users with different roles, create channels, and load conversations into the desired channel. See the README in `./server/automation` for more details.

### Export Channel History

See the README in `./server/export`.

### User Slash Command Listener
This enables users to use "/fetchAI" to manually call the API. We didn't end up using this apporach. Instead, we automatically collect the channel history when a conversation is pause(having a timeout) and generate actions through AI. 
