import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET() {
  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: userId } = jwt.decode(token, SECRET_KEY);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userQuery = `
        SELECT id, username, email, description, "profileImage", "firstName", "secondName"
        FROM users 
        WHERE id = $1
      `;

    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
