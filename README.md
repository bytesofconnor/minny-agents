# Minny Agents

Minny Agents is an independent engineering practice that builds AI agents for Twin Cities businesses. It is a service-area practice and lists no street address.

The site is [minnyagents.com](https://minnyagents.com). The public repository is [bytesofconnor/minny-agents](https://github.com/bytesofconnor/minny-agents).

## Run it locally

Install dependencies. Start the dev server.

```bash
npm install
npm run dev
```

Open the URL the dev server prints. The default is http://localhost:3000.

Run `npm run lint` to lint the project. Run `npm run build` to build it.

## Stack

The app uses Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, and ESLint 10. Exact versions are in `package.json`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for pull requests and auto-merge.

## Add a demo

A demo config lives in Convex. Do not commit a real restaurant to this repo.

Create a token with `openssl rand -hex 24`. From a machine logged in to the Minny Agents Convex project, run the command below. Use the same token again to update the config. `createdAt` stays as it was.

```bash
npx convex run demoConfigs:upsert '{
  "token": "<openssl rand -hex 24>",
  "restaurantName": "The Imaginary Supper Club",
  "neighborhood": "Example Junction",
  "hours": "Tuesday through Saturday, 5pm to 9pm",
  "menu": [{ "name": "Lantern toast", "price": "14" }],
  "reservations": "Call to book a table.",
  "ordering": "Pickup by phone. No delivery.",
  "phone": "612-555-0148",
  "website": "https://example.com/imaginary-supper-club",
  "faqs": [{ "question": "Do you take walk-ins?", "answer": "Yes, when a table is open." }],
  "sources": ["https://example.com/imaginary-supper-club"]
}'
```

Add `--prod` to write the production deployment. The long link is `https://minnyagents.com/demo/<token>`.

Set a readable slug on that token. The slug is lowercase words, hyphens, and a 4 to 16 character hex code. `setSlug` only changes the slug. A later `upsert` of the same token keeps it.

```bash
npx convex run demoConfigs:setSlug '{
  "token": "<same token>",
  "slug": "imaginary-supper-7cd4"
}'
```

The readable link is `https://minnyagents.com/demo/imaginary-supper-7cd4`. A long token that has a slug redirects there. Deploy these Convex functions to production before a slug lookup works on the production site.

When `AI_GATEWAY_API_KEY` is set, the chat answers through Vercel AI Gateway. Otherwise it answers from the config alone.
