import pool from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;

  try {
    const query = `
        SELECT * 
        FROM likes 
        WHERE "postId" = $1
    `;

    const result = await pool.query(query, [postId]);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;
    const userId = request.headers.get("user-id");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const queryIsLike = `
      SELECT *
      FROM likes
      WHERE "postId" = $1 AND "userId" = $2
    `;
    const likeResult = await pool.query(queryIsLike, [postId, userId]);

    if (likeResult.rows.length === 0) {
      const queryLike = `
        INSERT INTO likes ("postId", "userId", "creationDate")
        VALUES ($1, $2, $3)
      `;

      await pool.query(queryLike, [postId, userId, new Date()]);

      return NextResponse.json({ status: 200 });
    }

    return NextResponse.json({ message: "Already liked" }, { status: 409 });
  } catch (error) {
    console.error("Error in like API:", error);

    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;
    const userId = request.headers.get("user-id");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const queryIsLike = `
      SELECT *
      FROM likes
      WHERE "postId" = $1 AND "userId" = $2
    `;
    const likeResult = await pool.query(queryIsLike, [postId, userId]);

    if (likeResult.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Already disliked",
        },
        { status: 409 }
      );
    }
    const queryDislike = `
        DELETE 
        FROM likes
        WHERE "postId"=$1 AND "userId"=$2
      `;

    await pool.query(queryDislike, [postId, userId]);

    return NextResponse.json({ status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
