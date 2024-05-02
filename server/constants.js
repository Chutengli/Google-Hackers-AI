import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

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

const epics = [
  { name: "Q1 frontend new features" },
  { name: "Q2 backend new features" },
  { name: "Q1 frontend bug bash" },
  { name: "Q2 backend bug bash" },
  { name: "Tech debt items" },
  { name: "Q1 UX designs" },
];

export const JSONPrompt = {
  task_description:
    "Develop a Gemini AI feature to act as a Scrum Master in team communication channels. The AI should continuously monitor conversations and make decisions about when to create JIRA stories/issues based on the content and context of the discussions. If the conversation indicates that more discussion is needed before action, the AI should acknowledge this by learning from the conversation and storing relevant information to create a JIRA ticket later. When a decision to create a ticket is made, the AI should automatically generate and populate a JIRA issue with a description, assignee, reporter, deadline, and related JIRA board based on the ongoing discussion. Respond in a JSON format",
  current_task: ticketBoard,
  current_epics: epics,
  requirements: {
    listen:
      "Continuously monitor specific communication channels for relevant keywords and topics.",
    decision_making:
      "Use NLP to understand the context and progress of discussions, determining the right moment to transition from discussion to action.",
    learning_phase: {
      action: "store_conversation",
      response: {
        ack: true,
        message:
          "Still discussing, information is being compiled for future ticket creation.",
      },
    },
    action_phase: {
      action: "create_ticket",
      response: {
        ack: true,
        message: "Action required, creating JIRA issue.",
        details: {
          description: "[Automatically generated based on conversation]",
          assignee: "[Determined from conversation or default project lead]",
          reporter: "[Person initiating the conversation]",
          deadline: "[Derived from urgency in discussion or default timeline]",
          related_board: "[Specified project board]",
        },
      },
    },
  },
};

export const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};

export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export const modelStartingChatHistory =
  '[\n  {\n    "task_description": "Develop a Gemini AI feature to act as a Scrum Master in team communication channels. The AI should continuously monitor conversations and make decisions about when to create JIRA stories/issues based on the content and context of the discussions. If the conversation indicates that more discussion is needed before action, the AI should acknowledge this by learning from the conversation and storing relevant information to create a JIRA ticket later. When a decision to create a ticket is made, the AI should automatically generate and populate a JIRA issue with a description, assignee, reporter, deadline, and related JIRA board based on the ongoing discussion."\n  },\n  {\n    "requirements": {\n      "listen": "Continuously monitor specific communication channels for relevant keywords and topics.",\n      "decision_making": "Use NLP to understand the context and progress of discussions, determining the right moment to transition from discussion to action.",\n      "learning_phase": {\n        "action": "store_conversation",\n        "response": {\n          "ack": true,\n          "message": "Still discussing, information is being compiled for future ticket creation."\n        }\n      },\n      "action_phase": {\n        "action": "create_ticket",\n        "response": {\n          "ack": true,\n          "message": "Action required, creating JIRA issue.",\n          "details": {\n            "description": "[Automatically generated based on conversation]",\n            "assignee": "[Determined from conversation or default project lead]",\n            "reporter": "[Person initiating the conversation]",\n            "deadline": "[Derived from urgency in discussion or default timeline]",\n            "related_board": "[Specified project board]"\n          }\n        }\n      }\n    }\n  },\n  {\n    "ticketBoard": [\n      {\n        "task_id": null,\n        "task_content": "Set up server",\n        "status": "Done",\n        "deadline": null,\n        "assignee": "B",\n        "details": "Back-end server is successfully set up.",\n        "progress": "100%"\n      },\n      {\n        "task_id": null,\n        "task_content": "Develop user management APIs",\n        "status": "Doing",\n        "deadline": null,\n        "assignee": "B",\n        "details": "Coding of basic user management APIs has begun.",\n        "progress": "0%"\n      },\n      {\n        "task_id": null,\n        "task_content": "Sync on data needs for front-end forms",\n        "status": "To do",\n        "deadline": null,\n        "assignee": "B",\n        "details": "B needs to discuss data requirements with E for designing front-end forms.",\n        "progress": "10%"\n      },\n      {\n        "task_id": null,\n        "task_content": "Draft initial wireframes for the application",\n        "status": "To do",\n        "deadline": null,\n        "assignee": "E",\n        "details": "E will create initial wireframes and share with B and D for feedback.",\n        "progress": "50%"\n      },\n      {\n        "task_id": null,\n        "task_content": "Review and provide feedback on wireframes",\n        "status": "To do",\n        "deadline": null,\n        "assignee": "B",\n        "details": "B and D need to review wireframes and provide feedback to E.",\n        "progress": "50%"\n      }\n    ]\n  }\n]';
