import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db.js";
import { withValidation } from "@/utils/decorators";
import { NoteSchema } from "@/schema";
import { INote } from "@/interfaces";

export const POST = withValidation(
  NoteSchema,
  async (_: NextRequest, validatedData: INote) => {
    const {
      userId,
      title,
      body,
      desk,
      x: pageX,
      y: pageY,
      deskId,
      height,
      width,
    } = validatedData;
    const query = `
      INSERT INTO notes ("authorId", title, body, desk, x, y, height, width, "deskId", "createdAt") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      title,
      body,
      desk,
      pageX,
      pageY,
      height,
      width,
      deskId,
      new Date(),
    ]);
    return NextResponse.json({ data: result.rows[0] });
  }
);
