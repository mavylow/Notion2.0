import pool from "@/db/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import z, { success, ZodError } from "zod";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(request) {
  const comment = await request.json();

  const CommentsSchema = z.object({
    postId: z.number(),
    text: z.string().max(30),
  });

  try {
    CommentsSchema.parse(comment);
    const { postId, text } = comment;

    const queryPost = `
        SELECT * 
        FROM posts
        WHERE id = $1
        `;

    const postResult = await pool.query(queryPost, [postId]);

    if (!postResult) {
      return NextResponse.json(
        { error: "Post with this id doesn`t exist" },
        { status: 404 }
      );
    }

    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const { data: authorId } = await jwt.decode(token, SECRET_KEY);

    const queryComment = `
        INSERT INTO comments ("postId", "authorId", text, "creationDate")
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;

    const commentsResult = await pool.query(queryComment, [
      postId,
      authorId,
      text,
      new Date(),
    ]);

    if (!queryComment) {
      return NextResponse.json(
        { error: "Error fetching comments" },
        { status: 403 }
      );
    }

    if (!commentsResult.rows) {
      return NextResponse.json({ error: "Data is clean" }, { status: 204 });
    }

    return NextResponse.json({ success: true, data: commentsResult.rows[0] });
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
