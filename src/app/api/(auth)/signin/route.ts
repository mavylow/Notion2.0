import pool from "@/db/db";
import { startSession } from "@/utils/session";
import { t } from "i18next";
import { NextRequest, NextResponse } from "next/server";
import z, { email, ZodError } from "zod";

const bcrypt = require("bcrypt");

const SingInSchema = z.object({
  email: z.email("Write correct email"),
  password: z
    .string()
    .min(8, t("shortPassword"))
    .max(14, t("longPassword"))
    .regex(/[0-9]/, t("passwordContainNumber")),
});

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { email, password } = reqBody;

  try {
    SingInSchema.parse({ email, password });

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
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
