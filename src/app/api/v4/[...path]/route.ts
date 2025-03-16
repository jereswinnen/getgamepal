import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// IGDB API credentials
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`
    );
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error: any) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  console.log("Received request:");
  console.log("Path:", params.path);
  console.log("Method:", request.method);

  try {
    const body = await request.text();
    console.log("Body:", body);

    const token = await getAccessToken();
    console.log("Got access token:", token);

    const endpoint = params.path.join("/");
    const igdbResponse = await axios({
      url: `https://api.igdb.com/v4/${endpoint}`,
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      data: body,
    });

    console.log("IGDB Response:", igdbResponse.data);
    return NextResponse.json(igdbResponse.data);
  } catch (error: any) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    return NextResponse.json(
      {
        message: "An error occurred",
        error: error.response ? error.response.data : error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Health check endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // If the path is "health", return a health check response
  if (params.path.length === 1 && params.path[0] === "health") {
    return NextResponse.json({ status: "OK", message: "Server is healthy" });
  }

  // Otherwise, return a method not allowed response
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
