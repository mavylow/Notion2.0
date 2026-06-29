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

    const { data: authorId } = await jwt.decode(token, SECRET_KEY);

    if (!authorId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const query = `
    SELECT * 
    FROM likes
    WHERE "userId"=$1
    `;

    const result = await pool.query(query, [authorId]);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid server error" },
      { status: 500 }
    );
  }
}
