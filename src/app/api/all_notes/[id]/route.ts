import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db.js";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = request.headers.get("user-id");
  try {
    const deskQuery = `SELECT * FROM desks WHERE link = $1`;
    const deskResult = await pool.query(deskQuery, [id]);

    if (!deskResult.rows || deskResult.rows.length === 0) {
      return NextResponse.json({ error: "Desk not found" }, { status: 404 });
    }

    const activeDesk = deskResult.rows[0];
    const isPublic = activeDesk.public === true;
    const isAuthor = activeDesk.authorId === userId;

    if (isAuthor) {
      const notesQuery = `
        SELECT 
          id,
          "authorId",
          title,
          body,
          desk,
          x,
          y,
          height,
          width,
          "deskId",
          "createdAt"
        FROM notes 
        WHERE "deskId" = $1
        ORDER BY "createdAt" DESC
      `;

      const result = await pool.query(notesQuery, [activeDesk.id]);

      return NextResponse.json({
        data: { notes: result.rows, deskId: activeDesk.id },
        count: result.rows.length,
      });
    }

    if (isPublic && !isAuthor) {
      const queryPermission = `
        SELECT * FROM permissions 
        WHERE "userId" = $1 AND "deskId" = $2
      `;

      const userPermission = await pool.query(queryPermission, [
        userId,
        activeDesk.id,
      ]);

      if (userPermission.rows.length === 0) {
        const addPermissionQuery = `
          INSERT INTO permissions ("userId", "grantedBy", "permissionStatus", "deskId", "grantedAt")
          VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(addPermissionQuery, [
          userId,
          activeDesk.authorId,
          "edit",
          activeDesk.id,
          new Date(),
        ]);
      }

      const notesQuery = `
        SELECT 
          id,
          "authorId",
          title,
          body,
          desk,
          x,
          y,
          height,
          width,
          "deskId",
          "createdAt"
        FROM notes 
        WHERE "deskId" = $1
        ORDER BY "createdAt" DESC
      `;

      const result = await pool.query(notesQuery, [activeDesk.id]);

      return NextResponse.json({
        data: { notes: result.rows, deskId: activeDesk.id },
        count: result.rows.length,
      });
    }

    if (!isPublic && !isAuthor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch notes",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
