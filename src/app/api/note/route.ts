import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db.js";

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { userId, note, desk, x: pageX, y: pageY, createdAt } = reqBody;

  try {
    const query = `
      INSERT INTO notes ("authorId", title, body, desk, x, y, "createdAt") 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      note.title,
      note.body,
      desk,
      pageX,
      pageY,
      new Date(),
    ]);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("DB Connection Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      { status: 500 }
    );
  }
}

// export const addNote = async (req, res) => {
//   const { userId, title, body, desk, x, y, createdAt } = req.body;
//   try {
//     const query = `
//       INSERT INTO notes ("userId", title, body, desk, x, y, "createdAt")
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *
//     `;
//     const result = await pool.query(query, [
//       userId,
//       title,
//       body,
//       desk,
//       x,
//       y,
//       createdAt,
//     ]);
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
