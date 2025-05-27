import type { NextApiRequest, NextApiResponse } from "next";
import { updateUser } from "@/lib/actions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userId = parseInt(id as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await updateUser(userId, req.body);
    
    if (updatedUser) {
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser as any;
      return res.status(200).json(userWithoutPassword);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}