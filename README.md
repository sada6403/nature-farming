# Nature Farming

This repository contains the full source code for the **Nature Farming** ecosystem, including the public website, administrative portal, and dedicated REST API backend.

## Project Structure
- **/backend**: Dedicated Node.js & Express REST API server with PostgreSQL, JWT Auth, Multer storage, and Nodemailer.
- **/website**: The official public-facing website built with Next.js (App Router).
- **/admin**: The administrative portal for managing products, banners, branches, inquiries, gallery, and CMS settings.
- **/deploy**: VPS deployment configurations with PM2 (`ecosystem.config.js`) and Nginx.

## Identity
- **Legal Name**: Nature Farming (Pvt) Ltd
- **Registration No**: PV 00274199
- **Establishment**: 2023

## Tech Stack
- Frontend: Next.js (App Router) & Tailwind CSS
- Admin Portal: Next.js
- Backend API: Node.js, Express
- Database: PostgreSQL (`pg`)
- Authentication: JWT with bcrypt password hashing
- Storage: Local Multipart File Storage (`multer`)
- Email: Nodemailer (SMTP)

## Setup Guide
See [BACKEND-SETUP.md](./BACKEND-SETUP.md) for full database initialization, local development, and VPS deployment instructions.
