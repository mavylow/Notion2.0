import { NextResponse } from "next/server";
import pool from "@/db/db.js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET(request: Request, { params }) {
  const { id } = await params;
  console.log(id, "server");
  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: userId } = await jwt.decode(token, SECRET_KEY);

    const deskQuery = `SELECT *
        FROM desks 
        WHERE link = $1`;

    const deskResult = await pool.query(deskQuery, [id]);
    console.log(deskResult.rows[0]);

    if (!deskResult.rows) {
      return NextResponse.json(
        {
          error: "Desk not found",
        },
        { status: 404 }
      );
    }

    const notesQuery = `SELECT 
                id,
                "authorId",
                title,
                body,
                desk,
                x,
                y,
                "deskId",
                "createdAt"
              FROM notes 
              WHERE "deskId" = $1
              ORDER BY "createdAt" DESC`;

    const activeDesk = deskResult.rows[0];

    if (activeDesk.public === true) {
      const result = await pool.query(notesQuery, [activeDesk.id]);
      return NextResponse.json({
        success: true,
        data: { notes: result.rows, deskId: activeDesk.id },
        count: result.rows.length,
      });
    }

    if (activeDesk.public === false && activeDesk.authorId !== userId) {
      console.log("authorId", activeDesk.authorId);
      return NextResponse.json(
        {
          error: "Permission denied",
        },
        { status: 401 }
      );
    }
  } catch (err) {
    console.log("Error fetching notes:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch notes",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
