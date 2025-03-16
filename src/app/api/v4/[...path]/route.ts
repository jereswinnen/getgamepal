import { NextRequest, NextResponse } from "next/server";

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
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
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
  context: { params: { path: string[] } }
) {
  try {
    // Await the entire params object
    const params = await context.params;
    const pathParams = params.path;

    console.log("Received request:");
    console.log("Path:", pathParams);
    console.log("Method:", request.method);

    const body = await request.text();
    console.log("Body:", body);

    const token = await getAccessToken();
    console.log("Got access token:", token);

    // Check if CLIENT_ID exists before making the request
    if (!CLIENT_ID) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const endpoint = pathParams.join("/");
    const igdbResponse = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: body,
    });

    const data = await igdbResponse.json();
    console.log("IGDB Response:", data);
    return NextResponse.json(data);
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
  context: { params: { path: string[] } }
) {
  try {
    // Await the entire params object
    const params = await context.params;
    const pathParams = params.path;

    // If the path is "health", return a health check response
    if (pathParams.length === 1 && pathParams[0] === "health") {
      return NextResponse.json({ status: "OK", message: "Server is healthy" });
    }

    // Otherwise, return a method not allowed response
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred", error: String(error) },
      { status: 500 }
    );
  }
}
