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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automation (Contact submissions)

This project previously used external automation webhooks (Zapier) for `app/api/contact`. The repository now contains an in-house automation handler that:

- Persists contact submissions to `data/contacts.jsonl` (JSON Lines format).
- Optionally sends a notification email using Resend when the following env vars are configured:

  - `RESEND_API_KEY` — your Resend API key
  - `NOTIFY_EMAIL` — destination email for notifications
  - `FROM_EMAIL` — verified sender email

  PushPress integration:

  - `PUSHPRESS_API_URL` — the PushPress API endpoint or webhook URL to create leads (e.g. https://api.pushpress.com/v1/leads). If set, submissions will be POSTed to this URL.
  - `PUSHPRESS_API_KEY` — optional API key/token; when provided it will be sent as `Authorization: Bearer <key>`.

  If you want the application to create leads in PushPress automatically, set these environment variables in your deployment. The in-house automation will persist contacts locally to `data/contacts.jsonl` and then attempt to forward them to PushPress when configured.

Migration notes:

- There are no remaining Zapier webhook calls in the codebase. If you relied on Zapier to forward contacts to other services, recreate any Zapier workflows using the persisted `data/contacts.jsonl` or integrate directly with your target service using a small script that reads that file.
- To run the included check, use:

```bash
npm test
```

This will run a small test that verifies contact submissions are persisted.
