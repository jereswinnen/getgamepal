# GamePal

GamePal is a Next.js application that serves as both a marketing website and an IGDB API proxy for the GamePal iOS app. It allows users to browse games, view game details, and provides a secure way to access the IGDB API.

## Features

- **Marketing Website**: Showcase the GamePal iOS app and its features
- **IGDB API Proxy**: Securely proxy requests to the IGDB API
- **Game Browser**: Browse popular games from the IGDB database
- **Game Details**: View detailed information about specific games

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/getgamepal.git
   cd getgamepal
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env.local` file based on the `.env.local.example` file:

   ```bash
   cp .env.local.example .env.local
   ```

4. Add your IGDB API credentials to the `.env.local` file:

   ```
   IGDB_CLIENT_ID=your_client_id_here
   IGDB_CLIENT_SECRET=your_client_secret_here
   ```

   You can obtain these credentials by registering at the [Twitch Developer Portal](https://dev.twitch.tv/console/apps).

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Production

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Deployment on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com).

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import the project to Vercel
3. Add your environment variables (IGDB_CLIENT_ID and IGDB_CLIENT_SECRET)
4. Deploy

## API Usage

The API proxy is available at `/api/v4/[endpoint]`. For example, to query games:

```
POST /api/v4/games
Content-Type: text/plain

fields name, cover.url, summary;
where id = 1942;
limit 1;
```

For more information about the IGDB API, refer to the [official documentation](https://api-docs.igdb.com/).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
