# Radar

Real-time, crowd-sourced police, hazard, and speed camera alerts for Tesla drivers. Built with Next.js 16 (App Router), React 19, TypeScript 5, and Tailwind CSS 4.

**Live at [radar-tesla.vercel.app](https://radar-tesla.vercel.app)**

> **License**: Free for personal, non-commercial use. See [LICENSE](./LICENSE) for details. Radar is built on the open-source TeslaNav project.

## Features

- Turn-by-turn navigation powered by Mapbox Directions API
- Real-time driver alerts (police, accidents, hazards, road closures)
- OSM speed camera overlay
- Satellite and 3D terrain map modes
- GPS track recording and playback (GPX export)
- Offline tile caching via service worker
- Touch-optimized UI designed for Tesla's in-car browser, with full mobile support

## Development

### Prerequisites

- [Bun](https://bun.sh) (package manager)
- A Mapbox account with a public token
- Upstash Redis database
- LocationIQ API key (geocoding)
- Vercel Blob storage token (GPX recording)

### Setup

```bash
git clone https://github.com/ShayalaW/teslanav.com.git
cd teslanav.com
bun install
cp .env.example .env.local  # fill in your tokens
bun dev
```

### Deploy

Pushes to `main` auto-deploy to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShayalaW/teslanav.com)
