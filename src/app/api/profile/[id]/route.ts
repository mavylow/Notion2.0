import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";

export async function GET(_, { params }) {
  const { id } = await params;
  try {
    const userQuery = `
        SELECT id, username, email, description, "profileImage", "firstName", "secondName"
        FROM users 
        WHERE id = $1
      `;

    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    const responseUser = Object.assign({}, user);
    delete responseUser.password;

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
