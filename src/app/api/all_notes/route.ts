import { NextResponse } from "next/server";
import pool from "@/db/db.js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const result = await pool.query(
      `SELECT 
          id,
          "authorId",
          title,
          body,
          desk,
          x,
          y,
          "createdAt"
        FROM notes 
        WHERE "authorId" = $1
        ORDER BY "createdAt" DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error("Error fetching notes:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch notes",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
