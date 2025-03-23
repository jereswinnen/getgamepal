import { cacheManager } from "../cache";

// IGDB API credentials
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// Authentication state
let accessToken: string | null = null;
let tokenExpiry = 0;

// Rate limiting settings
const MAX_REQUESTS_PER_SECOND = 4;
const requestTimestamps: number[] = [];

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

let rateLimitInfo: RateLimitInfo = {
  limit: MAX_REQUESTS_PER_SECOND,
  remaining: MAX_REQUESTS_PER_SECOND,
  reset: Date.now() + 1000,
};

/**
 * Get a valid access token for IGDB API
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    // Try to get token from cache first
    const cachedToken = await cacheManager.get<{
      token: string;
      expiry: number;
    }>("igdb_access_token");
    if (cachedToken && Date.now() < cachedToken.expiry) {
      accessToken = cachedToken.token;
      tokenExpiry = cachedToken.expiry;
      return accessToken;
    }

    // Get new token from Twitch API
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(
        `Token request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Expire 1 minute early to be safe

    // Cache the token
    await cacheManager.set("igdb_access_token", {
      token: accessToken,
      expiry: tokenExpiry,
    });

    if (!accessToken) {
      throw new Error("Access token is null or empty");
    }

    return accessToken;
  } catch (error: any) {
    console.error("Error getting access token:", error.message);
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

/**
 * Check and respect rate limits
 */
async function checkRateLimit(): Promise<void> {
  // Clean up old request timestamps
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 1000) {
    requestTimestamps.shift();
  }

  // Check if we've hit the rate limit
  if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    const waitTime = 1000 - (now - requestTimestamps[0]);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // Add the current request timestamp
  requestTimestamps.push(Date.now());
}

/**
 * Update rate limit info based on API response headers
 */
function updateRateLimitInfo(headers: Headers): void {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");

  if (limit && remaining && reset) {
    rateLimitInfo = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10) * 1000, // Convert to milliseconds
    };
  }
}

/**
 * Query the IGDB API
 */
export async function queryIGDB<T = any>(
  endpoint: string,
  query: string,
  cacheKey?: string
): Promise<T> {
  // Check cache first if cache key is provided
  if (cacheKey) {
    const cachedData = await cacheManager.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  await checkRateLimit();

  try {
    const token = await getAccessToken();

    if (!CLIENT_ID) {
      throw new Error("IGDB_CLIENT_ID is not configured");
    }

    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: query,
    });

    // Update rate limit info from headers
    updateRateLimitInfo(response.headers);

    if (!response.ok) {
      throw new Error(
        `IGDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as T;

    // Save to cache if cache key is provided
    if (cacheKey) {
      await cacheManager.set(cacheKey, data);
    }

    return data;
  } catch (error: any) {
    console.error(`IGDB API error for ${endpoint}:`, error.message);
    throw new Error(`Failed to fetch data from IGDB: ${error.message}`);
  }
}

/**
 * Get current rate limit info
 */
export function getRateLimitInfo(): RateLimitInfo {
  return { ...rateLimitInfo };
}
