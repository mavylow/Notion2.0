import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET() {
  try {
    const query = `
    SELECT * 
    FROM groups
    `;

    const result = await pool.query(query);

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
