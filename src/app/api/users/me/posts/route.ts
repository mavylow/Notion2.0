import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(request: NextRequest) {
  try {
    const authorId = request.headers.get("user-id");

    const query = `
    SELECT * 
    FROM posts
    WHERE "authorId"=$1
    `;

    const result = await pool.query(query, [authorId]);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid server error" },
      { status: 500 }
    );
  }
}
