# Automation 
This series of scirpts create a set of users and use the identity to send chat to a newly created conversation. 

## How to run it - Order of Execution
All commands should be executed in server directory. 
1. Create Users. This read the info from the `./automation/data/users.json` file and update the token. Run this as well when a info is changed or user is added. 
```sh
node --env-file=.env ./automation/createUser.js
```
2. create history. This read the user info from json file, create the channel and add the user base on the user list. Append the chat conversation from `./automation/data/chatHistory.json`
```sh
 npm run createHistory
 or
 node --env-file=.env ./automation/createHistory.js
 ```

Bonus:
1. To send a message with specific user
```sh
node --env-file=.env ./automation/utils/userASendMessage.js ui "this is a speaking from the scrip"
```

## Persistent Data under `./data`
### users.json
Stores all the user data and their tokens. To create a user, just add the information in JSON(follow the pattern), except token. This is due to we will run create user script to register user and create token(users.json will be updated as well).
### chatHistory.json
This represent the conversaton in a channel in chronological order. The `id` field should match the id in users.json so we know who is talking. 

## Q&A
### Whats the difference between class `UserClient` and `ChatClient`?
UserClient is used for creatign user A-E fake clients. We only use them when executing the stand alone js script. The ChatClient represent the current user starting the server process. 