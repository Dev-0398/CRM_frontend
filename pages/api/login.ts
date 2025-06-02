import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import configs from "@/config"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;
  try {
    const fastapiResponse = await fetch(`${configs.API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
        scope: "",
        client_id: "string",
        client_secret: "string",
      }),
      // Add timeout and keepalive
      signal: AbortSignal.timeout(10000), // 10 second timeout
      keepalive: true,
    });

    if (!fastapiResponse.ok) {
      const errorData = await fastapiResponse.json().catch(() => ({}));
      return res.status(fastapiResponse.status).json({ 
        message: "Invalid credentials",
        details: errorData 
      });
    }

    const data = await fastapiResponse.json();
    const cookieData = {
      token: data.access_token,
      role: data.user?.role || "",
    };

    const cookieList = Object.entries(cookieData).map(([name, value]) =>
      serialize(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600,
      })
    );
    res.setHeader("Set-Cookie", cookieList);
    return res.status(200).json(data);

  } catch (error) {
    console.error("Login error:", error);
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      message: "Failed to connect to authentication service",
      details: errorMessage,
      timestamp: new Date().toISOString()
    };
    return res.status(500).json(errorDetails);
  }
}
