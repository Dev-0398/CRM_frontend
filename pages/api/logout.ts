  import type { NextApiRequest, NextApiResponse } from "next";
  import { serialize } from "cookie";

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    try {
      // Clear cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
        maxAge: 0, // Expire immediately
      };

      const clearCookies = [
        serialize("token", "", cookieOptions),
        serialize("role", "", cookieOptions),
      ];

      res.setHeader("Set-Cookie", clearCookies);
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
