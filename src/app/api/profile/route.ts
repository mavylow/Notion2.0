// app/api/profile/route.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import pool from "@/db/db";

const SECRET_KEY = process.env.SECRET_KEY;

interface IProfileUpdateData {
  username?: string;
  email?: string;
  description?: string;
  image?: string;
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get("user-id");
    const body = await request.json();
    const { username, email, description, image }: IProfileUpdateData = body;

    if (!username && !email && !description && !image) {
      return NextResponse.json(
        { error: "At least one field is required for update" },
        { status: 400 }
      );
    }

    const checkUserQuery = `
      SELECT id, username, email, description, "profileImage", "firstName", "secondName"
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(checkUserQuery, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = userResult.rows[0];

    if (email && email !== currentUser.email) {
      const emailCheckQuery = `
        SELECT id FROM users WHERE email = $1 AND id != $2
      `;
      const emailCheckResult = await pool.query(emailCheckQuery, [
        email,
        userId,
      ]);

      if (emailCheckResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    if (username && username !== currentUser.username) {
      const usernameCheckQuery = `
        SELECT id FROM users WHERE username = $1 AND id != $2
      `;
      const usernameCheckResult = await pool.query(usernameCheckQuery, [
        username,
        userId,
      ]);

      if (usernameCheckResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (image !== undefined) {
      updates.push(`"profileImage" = $${paramIndex++}`);
      values.push(image);
    }

    updates.push(`"modifiedDate" = NOW()`);

    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, values);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    const updatedUser = updateResult.rows[0];

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error in profile update:", error);

    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
