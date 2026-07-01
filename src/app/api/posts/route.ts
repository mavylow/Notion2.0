import pool from "@/db/db";
import { TPostForm } from "@/interfaces";
import { PostSchema } from "@/schema";
import { withValidation } from "@/utils/decorators";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
    SELECT * FROM posts`;

    const result = await pool.query(query);

    if (!result) {
      return NextResponse.json(
        { error: "Posts doesn`t exist" },
        { status: 204 }
      );
    }
    const posts = result.rows;

    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Error with the server" },
      { status: 500 }
    );
  }
}

export const POST = withValidation(
  PostSchema,
  async (request: NextRequest, validatedData: TPostForm) => {
    const userId = request.headers.get("user-id");

    const { title, content, image } = validatedData;

    const query = `
    INSERT INTO posts ("authorId", title, content, image, "creationDate")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *

    `;

    const result = await pool.query(query, [
      userId,
      title,
      content,
      image,
      new Date(),
    ]);

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  }
);
