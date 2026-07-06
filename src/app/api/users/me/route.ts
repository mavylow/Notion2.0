import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("user-id");

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

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
