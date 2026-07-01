import pool from "@/db/db";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const query = `
          SELECT 
          FROM comments
          WHERE id = $1
          `;

    const commentResult = await pool.query(query, [id]);

    if (!commentResult) {
      return NextResponse.json(
        { error: "Comment with this id doesn`t exist" },
        { status: 404 }
      );
    }

    const queryComment = `
          DELETE 
          FROM comments
          WHERE id = $1
          `;

    await pool.query(queryComment, [id]);

    return NextResponse.json({ status: 204 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
