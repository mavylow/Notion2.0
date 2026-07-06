import pool from "@/db/db";
import { TComment } from "@/interfaces";
import { CommentSchema } from "@/schema";
import { withValidation } from "@/utils/decorators";
import { NextRequest, NextResponse } from "next/server";

export const POST = withValidation(
  CommentSchema,
  async (request: NextRequest, validatedData: TComment) => {
    const { postId, text } = validatedData;

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

    const userId = request.headers.get("user-id");

    const queryComment = `
        INSERT INTO comments ("postId", "authorId", text, "creationDate")
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;

    const commentsResult = await pool.query(queryComment, [
      postId,
      userId,
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

    return NextResponse.json({ data: commentsResult.rows[0] }, { status: 201 });
  }
);
