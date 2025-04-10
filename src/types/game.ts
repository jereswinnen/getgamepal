export interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  summary?: string;
  screenshots?: {
    id: number;
    url: string;
  }[];
  videos?: {
    id: number;
    video_id: string;
    name?: string;
  }[];
  platforms?: {
    id: number;
    name: string;
  }[];
  involved_companies?: {
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  first_release_date?: number;
  genres?: {
    id: number;
    name: string;
  }[];
  game_modes?: {
    id: number;
    name: string;
  }[];
  url?: string;
  total_rating?: number;
  rating_count?: number;
  similar_games?: {
    id: number;
    name: string;
  }[];
  franchise?: {
    id: number;
    name: string;
  };
  franchises?: {
    id: number;
    name: string;
  }[];
}
