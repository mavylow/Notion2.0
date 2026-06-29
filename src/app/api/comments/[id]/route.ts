import pool from "@/db/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(_, { params }) {
  const { id } = await params;

  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

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
