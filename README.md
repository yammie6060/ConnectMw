# ConnectMW

ConnectMW is a Next.js web app for Malawi's local services marketplace. It presents rentals, beauty services, and auto spares in one consumer-facing platform, with account entry points for customers and service providers.

## Features

- Responsive landing page for ConnectMW
- Hero carousel highlighting HomeConnect, BeautyConnect, and SpareFinder
- Services section with image carousels and feature lists
- Process, about, reviews, call-to-action, contact, and footer sections
- Sign in, sign up, forgot-password, and reset-password UI flows
- Role-aware sign-up fields for customers, landlords, beauty providers, and spare parts sellers
- Tailwind CSS styling with Lucide React icons

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server after a successful build.

## Current Notes

- The contact form currently shows a local success state and does not submit to a backend.
- Service and payment buttons currently log intended navigation targets in the browser console.
- Forgot-password and reset-password UI calls `/api/auth/forgot-password` and `/api/auth/reset-password`; those API routes are not included yet.
- Several images are loaded from Unsplash URLs, so production deployments should allow those remote images if switching to Next Image optimization.

## Branding

ConnectMW is presented as a MiNDTech Company product with the tagline:

```text
Digital Mind. Reliable Technology.
```
