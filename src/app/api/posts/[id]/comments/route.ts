import pool from "@/db/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await context.params;

  try {
    const query = `
        SELECT * 
        FROM comments 
        WHERE "postId" = $1
    `;

    const result = await pool.query(query, [postId]);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!result.rows) {
      return NextResponse.json(
        { error: "No comments provided" },
        { status: 204 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
