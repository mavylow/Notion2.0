import pool from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }) {
  const { id } = await params;

  try {
    const query = `
     SELECT * 
     FROM notes
     WHERE id=$1
      `;
    const result = await pool.query(query, [id]);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const reqBody = await request.json();
    const { id } = await params;
    const noteQuery = `SELECT * FROM notes WHERE id = $1`;
    const note = await pool.query(noteQuery, [id]);

    if (note.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Note with this id doesn't exist",
        },
        { status: 404 }
      );
    }

    console.log(reqBody);

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (reqBody.title !== undefined) {
      if (!reqBody.title || reqBody.title.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updates.push(`title = $${paramCount++}`);
      values.push(reqBody.title);
    }

    if (reqBody.body !== undefined) {
      updates.push(`body = $${paramCount++}`);
      values.push(reqBody.body);
    }

    if (reqBody.desk !== undefined) {
      updates.push(`desk = $${paramCount++}`);
      values.push(reqBody.desk);
    }

    if (reqBody.x !== undefined) {
      updates.push(`x = $${paramCount++}`);
      values.push(Math.floor(reqBody.x));
    }

    if (reqBody.y !== undefined) {
      updates.push(`y = $${paramCount++}`);
      values.push(Math.floor(reqBody.y));
    }

    if (reqBody.height !== undefined) {
      updates.push(`height = $${paramCount++}`);
      values.push(Math.floor(reqBody.height));
    }

    if (reqBody.width !== undefined) {
      updates.push(`width = $${paramCount++}`);
      values.push(Math.floor(reqBody.width));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);

    const query = `
      UPDATE notes
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const reqBody = await request.json();
    let { title, body, desk, x, y } = reqBody;
    const { id } = await params;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Title is required",
        },
        { status: 400 }
      );
    }

    const noteQuery = `SELECT * FROM notes WHERE id = $1`;
    const note = await pool.query(noteQuery, [id]);

    if (note.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Note with this id doesn't exist",
        },
        { status: 404 }
      );
    }

    const query = `
      UPDATE notes
      SET title = $1,
          body = $2,
          desk = $3,
          x = $4,
          y = $5,
          "updatedAt" = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      body || null,
      desk || null,
      x || 0,
      y || 0,
      id,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;

    const noteQuery = `DELETE FROM notes WHERE id = $1`;
    const note = await pool.query(noteQuery, [id]);

    if (note.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Note with this id doesn't exist",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
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
