# nature-farming

This repository contains the full source code for the **Nature Farming** ecosystem, including the public-facing website and the administrative dashboard.

## Project Structure
- **/website**: The official public-facing website built with Next.js.
- **/admin**: The administrative portal for managing products, banners, inquiries, and gallery content.

## Identity
- **Legal Name**: Nature Farming (Pvt) Ltd
- **Registration No**: PV 00274199
- **Establishment**: 2023

## Tech Stack
- Frontend: Next.js (App Router)
- Styling: Tailwind CSS
- Backend/DB: Supabase
- Icons: Lucide React
- Animations: Framer Motion

## Production Backend

Use `supabase_production.sql` for the complete database, RLS, storage and admin authorization setup. Public inquiries are validated and rate-limited by the website's `/api/inquiries` server route before being written with the server-only service role.

Setup instructions: [BACKEND-SETUP.md](./BACKEND-SETUP.md)
