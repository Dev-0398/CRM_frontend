import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import configs from "@/config"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    });

    if (!fastapiResponse.ok) {
      return res.status(fastapiResponse.status).json({ message: "Invalid credentials" });
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
