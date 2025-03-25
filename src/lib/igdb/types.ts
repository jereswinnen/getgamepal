// IGDB API Types

export interface GameResult {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  url?: string;
  cover?: {
    id: number;
    url: string;
  };
  first_release_date?: number;
  release_dates?: ReleaseDate[];
  rating?: number;
  rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  genres?: Genre[];
  game_modes?: GameMode[];
  platforms?: Platform[];
  involved_companies?: InvolvedCompany[];
  screenshots?: Screenshot[];
  videos?: Video[];
  similar_games?: GameResult[];
  artworks?: Artwork[];
  dlcs?: GameResult[];
  expansions?: GameResult[];
  parent_game?: GameResult;
  franchise?: Franchise;
  franchises?: Franchise[];
  status?: number;
  category?: number;
  themes?: Theme[];
  player_perspectives?: PlayerPerspective[];
  game_engines?: GameEngine[];
  age_ratings?: AgeRating[];
  websites?: Website[];
  hypes?: number;
  follows?: number;
}

export interface ReleaseDate {
  id: number;
  date: number;
  platform?: Platform;
  region?: number;
  human: string;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  abbreviation?: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface GameMode {
  id: number;
  name: string;
  slug: string;
}

export interface InvolvedCompany {
  id: number;
  company: Company;
  developer: boolean;
  publisher: boolean;
  supporting: boolean;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo?: {
    id: number;
    url: string;
  };
}

export interface Screenshot {
  id: number;
  url: string;
  width: number;
  height: number;
}

export interface Video {
  id: number;
  name: string;
  video_id: string;
}

export interface Artwork {
  id: number;
  url: string;
  width: number;
  height: number;
}

export interface Theme {
  id: number;
  name: string;
  slug: string;
}

export interface PlayerPerspective {
  id: number;
  name: string;
  slug: string;
}

export interface GameEngine {
  id: number;
  name: string;
  slug: string;
}

export interface AgeRating {
  id: number;
  category: number;
  rating: number;
}

export interface Website {
  id: number;
  category: number;
  url: string;
}

// Discovery Section Definition
export interface DiscoverySection {
  id: string; // Unique identifier/slug
  name: string; // User-friendly display name
  query: string; // IGDB API query
  endpoint: string; // IGDB API endpoint (default: 'games')
  description?: string; // Optional description
  transform?: (data: GameResult[]) => GameResult[]; // Optional transformation function
}

// Section metadata for client consumption
export interface DiscoverySectionMeta {
  id: string;
  name: string;
  description?: string;
  count?: number;
  lastUpdated?: string;
}

// Discovery response format
export interface DiscoveryResponse {
  section: DiscoverySectionMeta;
  games: GameResult[];
}

// Featured response format
export interface FeaturedResponse {
  sections: DiscoverySectionMeta[];
  featured: {
    [key: string]: GameResult[];
  };
}

export interface Franchise {
  id: number;
  name: string;
  slug: string;
  games?: number[]; // Array of Game IDs that belong to this franchise
  url?: string;
  created_at?: number;
  updated_at?: number;
  checksum?: string;
}
