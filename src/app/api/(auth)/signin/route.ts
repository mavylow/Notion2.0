import pool from "@/db/db";
import { startSession } from "@/utils/session";
import { NextRequest, NextResponse } from "next/server";

const bcrypt = require("bcrypt");

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { email, password } = reqBody;

  try {
    const query = `
    SELECT * 
    FROM users 
    WHERE email = $1 
    `;

    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "User with this email doesn`t exist" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    const responseUser = Object.assign({}, user);
    delete responseUser.password;

    const token = await startSession(responseUser.id);

    const res = NextResponse.json({
      data: { token, user: responseUser },
    });

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
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
