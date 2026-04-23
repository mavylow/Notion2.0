import pool from "@/db/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import z, { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";

const DeskSchema = z.object({
  name: z.string().nonempty().max(20),
  link: z.string().optional(),
});

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET(request) {
  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: authorId } = await jwt.decode(token, SECRET_KEY);

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
      success: true,
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

export async function POST(request) {
  const desk = await request.json();
  const { name, public: isPublic } = desk;

  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: authorId } = await jwt.decode(token, SECRET_KEY);

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

    return NextResponse.json({ success: true, data: result.rows[0] });
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
