import pool from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY;

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

    return NextResponse.json({ success: true, data: posts }, { status: 200 });
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
    const validatedPost = PostSchema.parse(post);
    const { title, content, image } = validatedPost;

    const query = `
    INSERT INTO posts ("authorId", title, content, image, "creationDate")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *

    `;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userId } = await jwt.decode(token, SECRET_KEY);

    const result = await pool.query(query, [
      userId,
      title,
      content,
      image,
      new Date(),
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Incorrect data for post" },
        { status: 412 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
