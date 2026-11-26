# globalcapitalist blog platform

The project is split into a Next.js public site, an Express/MongoDB API, and a Vite React admin app.

## Backend

1. Make sure MongoDB is available and configure `backend/.env` using [backend/.env.example](./backend/.env.example). Keep the existing `.env` file and its credentials private.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. The seed script hashes the password before saving the admin account.

If Node cannot resolve MongoDB Atlas SRV records but Windows DNS can, set `DNS_SERVERS` in `backend/.env` to the machine's comma-separated DNS server IPs. The backend applies these only to Node's DNS resolver.

3. Run the API from `backend`:

   ```powershell
   npm install
   npm run dev
   ```

The API listens on port `5000` by default. `GET /` reports API/database status. `GET /api/site-content` serves the public site's navigation, labels, footer, and page content. `GET /api/posts?search=term` searches published post titles. `POST /api/contact` stores public contact form submissions; `GET /api/contact/admin` lists them for authenticated admins. Published posts are public; drafts and post write operations require the JWT returned by `POST /api/auth/login`. Authenticated post management uses `GET /api/posts/admin` and the standard post CRUD routes.

Seed published example posts, one draft, the initial admin, and the default public-site content from the `backend` directory with `npm run seed`. The command is safe to rerun: existing posts and the admin account are not overwritten; missing site-content defaults are added without replacing customized values.

## Frontend

The Next.js site renders published posts and all public-site copy from the backend API, with separate About, Category, and Contact pages, category/search filters, responsive post cards, and SEO metadata on individual posts. Contact form submissions are saved in MongoDB and can be viewed in the admin app. Post bodies may contain HTML; supported markup is sanitized before rendering.

1. Configure `frontend/.env.local` from [frontend/.env.example](./frontend/.env.example).
2. From `frontend`, install and start the site:

   ```powershell
   npm install
   npm run dev
   ```

The home page is at `http://localhost:3000`; published posts open at `/post/:slug`.

## Admin

1. From `admin`, copy `.env.example` to `.env` and adjust `VITE_API_URL` if the API is not at `http://localhost:5000/api`.
2. Install and start the admin app:

   ```powershell
   npm install
   npm run dev
   ```

Vite prints the local URL (normally `http://localhost:5173`). The admin includes sign-in, post statistics, post create/edit/delete workflows, and a private inbox for contact form submissions. Its login uses the backend credentials configured above.

Run the API checks from `backend` with `npm test`; build the admin from `admin` with `npm run build`.

## Deploying to Vercel

Deploy the three apps as separate Vercel projects connected to the same repository:

1. **API:** set the project Root Directory to `backend`. The `api/[...path].js` function adapts the Express API for Vercel and reuses the MongoDB connection between warm invocations.
2. **Public site:** set Root Directory to `frontend` and use the Next.js framework preset.
3. **Admin:** set Root Directory to `admin`; `admin/vercel.json` routes React Router paths back to the Vite app.

Configure these environment variables in the corresponding Vercel projects:

| Project | Variables |
| --- | --- |
| API | `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` |
| Public site | `NEXT_PUBLIC_API_URL=https://<api-domain>/api`, `NEXT_PUBLIC_SITE_URL=https://<site-domain>` |
| Admin | `VITE_API_URL=https://<api-domain>/api`, `VITE_SITE_URL=https://<site-domain>` |

Set `CORS_ORIGIN` to the exact public-site and admin origins, comma-separated, then redeploy the API. Ensure the MongoDB provider permits connections from the deployed API using an appropriate Vercel egress/networking setup. Keep secrets in Vercel's environment settings; do not commit `.env` files.

Before launch, seed the production database once with the production `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` configured locally: run `npm run seed` from `backend`. Do not run this against a database containing data you do not intend to seed.
