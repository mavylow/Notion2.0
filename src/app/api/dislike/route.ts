import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }
    const userId = request.headers.get("user-id");

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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in like API:", error);

    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
