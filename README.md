This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Application code uses TypeScript. Run `npm run typecheck` to check types without
building the application.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication configuration

Email and password registration and login use MongoDB. Configure `MONGO_URI` (or
`MONGODB_URI`) with a reachable MongoDB connection string and set `AUTH_SECRET`
to a random secret before running the app. Self-hosted deployments must also set
`AUTH_TRUST_HOST=true` when the app is behind a trusted proxy. Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

GitHub and Google sign-in are optional. To enable either provider, set both its
ID and secret (`GITHUB_ID` and `GITHUB_SECRET`, or `GOOGLE_ID` and
`GOOGLE_SECRET`).

## User data APIs

All data APIs require a signed-in user and only return or modify that user's
records. The app persists chat messages inside their chat document.

- `GET /api/chats`, `POST /api/chats`, and `GET/PATCH/DELETE /api/chats/[chatId]`
  manage chats and their messages.
- `POST /api/study` generates an answer, saves it to the owned chat, and records
  the provider-reported token counts.
- `GET/POST /api/study-sessions` and
  `GET/PATCH/DELETE /api/study-sessions/[sessionId]` manage saved study notes.
  Create with `topic`, `explanation`, and optional `difficulty`, `keyPoints`,
  and `example`.
- `GET/POST /api/documents` and `GET/PATCH/DELETE /api/documents/[documentId]`
  store and manage text or Markdown documents. Create with `title` and `content`;
  optional `fileName` and `contentType` are supported. Document text is limited
  to 1 MB; binary file uploads are not supported.
- `GET /api/usage` returns a user's request/token summary and recent usage
  records. Optional `limit`, `from`, and `to` query parameters filter results.
  Usage records are created by `/api/study`, not submitted by clients. Costs are
  returned as `null` until the provider supplies cost data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
