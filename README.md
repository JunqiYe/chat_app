This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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


## todos

- [x] interactive send
- [x] scolling through text
- [x] hide text that are out of screen

- [x] change underling store for sent and received text
- [x] display text bubble according to send and received text



### Frontend
- [ ] add select for most recent text
- [ ] add left panel such that select the chat
- [ ] replace with online text bubble [link](https://daisyui.com/components/chat/)
- [ ] make text area full screen when screen is small
- [ ] push notification


### Backend
- [ ] server should asssign convID instead of client
- [x] networking text (web socket) - peer to peer to start
- [x] add broadcast
- [ ] add http request for syncing messages
- [ ] using JWT for signing messages


### bug fixes
- research event.target, seems like values are crossing between elements, i.e. form values are getting set to recipients input
- counter is broken/not working
- ~~issue where sending the first text result in two text bubble~~

