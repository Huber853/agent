# agent

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_wopm5vjFDvV7qkRKjrepcHeAo0UW)

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

## FastAPI Backend

The backend lives in `backend/` and exposes the current review-agent data and AI helper endpoints.

```bash
python -m pip install -r backend/requirements.txt
corepack pnpm api
```

API docs are available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Create `backend/.env` from `backend/.env.example` to enable DeepSeek and Tavily, and create `.env.local` from `.env.example` so the frontend knows the API base URL. Do not commit real API keys.

Run the full app with two terminals:

```bash
corepack pnpm api
corepack pnpm dev
```

```bash
python -m pytest backend/tests -q
```

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
