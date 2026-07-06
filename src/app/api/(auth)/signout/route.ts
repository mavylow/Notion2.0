import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("session");

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return NextResponse.json({ error: "Error during logout" }, { status: 500 });
  }
}
