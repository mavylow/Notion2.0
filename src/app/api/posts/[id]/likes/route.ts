import pool from "@/db/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(_, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;

  try {
    const query = `
        SELECT * 
        FROM likes 
        WHERE "postId" = $1
    `;

    const result = await pool.query(query, [postId]);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
