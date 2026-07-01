import pool from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";

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

export async function POST(request: NextRequest) {
  const post = await request.json();

  const PostSchema = z.object({
    title: z.string().max(20).nonempty(),
    content: z.string().max(200).nullable(),
    image: z.string().nullable(),
  });

  try {
    const userId = request.headers.get("user-id");
    const validatedPost = PostSchema.parse(post);
    const { title, content, image } = validatedPost;

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
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Incorrect data for post" },
        { status: 412 }
      );
    }
    console.log(e);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
