# Atelier Noir

Atelier Noir is a fashion storefront built with TanStack Start, React, and Vite.

## Development

Install dependencies with Bun, then run the development server:

```bash
bun install
bun run dev
```

Run `bun run build` to create a production build.

## Deploy to Vercel

Import the repository into Vercel. The included `vercel.json` uses Bun with the
locked dependency file and builds the Nitro server with the Vercel preset.

Set the variables from `.env.example` in the Vercel project settings. Keep
server-only secrets such as `DATABASE_URL`, `SESSION_SECRET`, payment secrets,
and `EMAIL_API_KEY` out of client code and configure them for the appropriate
Vercel environments.

To verify the deployment build locally:

```bash
bun install --frozen-lockfile
bun run build:vercel
```

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
