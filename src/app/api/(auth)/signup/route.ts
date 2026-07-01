import pool from "@/db/db";
import { startSession } from "@/utils/session";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { withValidation } from "@/utils/decorators";
import { AuthSchema } from "@/schema";
import { TAuth } from "@/interfaces";

export const POST = withValidation(
  AuthSchema,
  async (_: NextRequest, validatedData: TAuth) => {
    const { email, password } = validatedData;

    const checkUserQuery = `SELECT * FROM users WHERE email = $1`;
    const existingUser = await pool.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery = `
      INSERT INTO users (email, password, username, "creationDate")
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, "creationDate"
    `;

    const result = await pool.query(insertUserQuery, [
      email,
      hashedPassword,
      email.split("@")[0],
      new Date(),
    ]);

    const newUser = result.rows[0];

    const token = await startSession(newUser.id);

    const responseUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.username,
      createdAt: newUser.creationDate,
    };

    const res = NextResponse.json(
      { data: { token, user: responseUser } },
      { status: 201 }
    );

    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 2,
    });

    return res;
  }
);
