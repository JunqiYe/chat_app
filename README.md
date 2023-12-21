## todos
- [x] update front end
- [x] add storage back into the server
- [ ] add collaspable side bar for mobile
- [x] on connect, fetch new messages
- [x] store user login credential for easy login 
- [ ] add push notifications [resources](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

- [x] interactive send
- [x] scolling through text
- [x] hide text that are out of screen

- [x] change underling store for sent and received text
- [x] display text bubble according to send and received text



### Frontend
- [ ] sort conversation by most recent text
- [ ] add select for most recent text
- [x] add left panel such that select the chat
- [ ] replace with online text bubble [link](https://daisyui.com/components/chat/)
- [x] make text area full screen when screen is small
- [ ] push notification
- [ ] add redux


### Backend
- [ ] add authentication
- [ ] update to secure connection https
- [ ] add image support
- [x] server should asssign convID instead of client
- [x] networking text (web socket) - peer to peer to start
- [x] add broadcast
- [x] add http request for syncing messages
- [ ] using JWT for signing messages

### Database Design - AWS DynamoDB

#### MessageHistory

Primary Key |Sort Key| Attribute 1 |Attribute 2 | Attribute 3
------------|--------|------|-----|----
ConversationID | Timestamp | UserID | IsImg | MsgData

Following DynamoDB best practice by using a single-table design. Primary key partitioning on Conversation ID allows low latency on search on specific message group. Query result will be sorted against the time that the message was send. The Database stores either the raw text message or a signed link to the location image is stored.

#### ConversationMembers

Primary Key |Sort Key| Attribute1 (GSI) |
------------|--------|------
ConversationID | N/a | UserID

Store every user that are within a conversation. Works for both private conversation and group conversations.

#### UserPoll

For linking with AWS Amplify front-end authentication.


### bug fixes
- make sure ctx and handler value are updated at the same time
- ~~research event.target, seems like values are crossing between elements, i.e. form values are getting set to recipients input~~
- ~~counter is broken/not working~~
- ~~issue where sending the first text result in two text bubble~~

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


## Documentation

### Backend API
<!-- #### `\login`
handled by the browser for login cookies. Allows for user to remain logged in for certain period of time

#### `\ws`
For upgrading a HTTP connection to a WebSocket connection. Allows for real-time communication with the server -->

#### `/api/convID`
- GET: 
    - URL Search Params：`userID`
    - return all the conversation that current user is in

- POST: 
    - URL Search Params：`userID`，`recipientID`
    - post to the server for a new conversation between the current user and new recipient user

#### `/api/chatHist`
- GET: 
    - URL Search Params：`convID`
    - return a list of messages from the current conversation 








## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



