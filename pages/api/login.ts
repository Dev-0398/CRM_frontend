import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET_KEY = "953a8ced-57ec-4c98-9cce-34d10e4dc8ad";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  if (username === "admin@gmail.com" && password === "admin123") {
    const token = jwt.sign({ username, name: "Murali", role: "User" }, SECRET_KEY, { expiresIn: "1h" });
    const role = "User";
    const cookieHasToset = [
      { name: "role", value: role },
      { name: "token", value: token },
    ];
    const cookies = cookieHasToset.map(({ name, value }) =>
      serialize(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600,
      })
    );
    res.setHeader("Set-Cookie", cookies);
    return res.status(200).json({ message: "Logged in" });
  }

  res.status(401).json({ message: "Invalid credentials" });
}
