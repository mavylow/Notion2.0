import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db.js";

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const {
    userId,
    note,
    desk,
    x: pageX,
    y: pageY,
    deskId,
    height,
    width,
  } = reqBody;

  try {
    const query = `
      INSERT INTO notes ("authorId", title, body, desk, x, y, height, width, "deskId", "createdAt") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      note.title,
      note.body,
      desk,
      pageX,
      pageY,
      height,
      width,
      deskId,

      new Date(),
    ]);
    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    console.error("DB Connection Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
