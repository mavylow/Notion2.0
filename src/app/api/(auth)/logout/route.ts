// app/api/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("session");

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);

    const cookieStore = await cookies();
    cookieStore.delete("session");

    return NextResponse.json(
      {
        success: false,
        error: "Error during logout",
      },
      { status: 500 }
    );
  }
}
