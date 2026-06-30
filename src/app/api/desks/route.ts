import pool from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";

const DeskSchema = z.object({
  name: z.string().nonempty().max(20),
  link: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authorId = request.headers.get("user-id");

    const queryOwnDesk = `
          SELECT * 
          FROM desks
          WHERE "authorId" = $1
          `;

    const resultOwnDesks = await pool.query(queryOwnDesk, [authorId]);

    const queryOtherDesks = `
          SELECT desks.id, link, "authorId", name, "creationDate" 
          FROM permissions
          LEFT JOIN desks on desks."id" = permissions."deskId"
          WHERE "userId" = $1
          `;

    const resultOtherDesks = await pool.query(queryOtherDesks, [authorId]);

    if (!resultOwnDesks || !resultOtherDesks) {
      return NextResponse.json(
        { error: "Error fetching desks" },
        { status: 403 }
      );
    }

    if (!resultOwnDesks.rows && !resultOtherDesks.rows) {
      return NextResponse.json({ error: "Data is clean" }, { status: 204 });
    }

    return NextResponse.json({
      data: resultOwnDesks.rows.concat(resultOtherDesks.rows),
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const desk = await request.json();
  const { name, public: isPublic } = desk;

  try {
    const authorId = request.headers.get("user-id");

    DeskSchema.parse(desk);

    const link = uuidv4();

    const queryDesk = `
        INSERT INTO desks ("authorId", name, link, public, "creationDate")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;

    const result = await pool.query(queryDesk, [
      authorId,
      name,
      link,
      isPublic,
      new Date(),
    ]);

    if (!result) {
      return NextResponse.json(
        { error: "Error fetching comments" },
        { status: 403 }
      );
    }

    if (!result.rows) {
      return NextResponse.json({ error: "Data is clean" }, { status: 204 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const deskId = await request.json();

    const authorId = request.headers.get("user-id");

    if (!authorId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const checkQuery = `
      SELECT * FROM desks 
      WHERE id = $1 AND "authorId" = $2
    `;

    const checkResult = await pool.query(checkQuery, [deskId, authorId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Desk not found or you don't have permission to delete it" },
        { status: 403 }
      );
    }

    const deleteNotesQuery = `
          DELETE FROM notes 
          WHERE "deskId" = $1
          RETURNING id, title
        `;
    const deletedNotes = await pool.query(deleteNotesQuery, [deskId]);

    const deletePermissionsQuery = `
          DELETE FROM permissions 
          WHERE "deskId" = $1
        `;
    await pool.query(deletePermissionsQuery, [deskId]);

    const deleteDeskQuery = `
          DELETE FROM desks 
          WHERE id = $1 AND "authorId" = $2
          RETURNING id, name
        `;

    const result = await pool.query(deleteDeskQuery, [deskId, authorId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete desk" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 204,
    });
  } catch (e) {
    console.error("Delete desk error:", e);

    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
