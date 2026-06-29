import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
const PUBLIC_ROUTES = [
  { route: "/signin", method: "POST" },
  { route: "/signup", method: "POST" },
  { route: "/api/login", method: "POST" },
  { route: "/api/posts", method: "GET" },
  { route: "/api/profile", method: "GET" },
];

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (
    PUBLIC_ROUTES.some(
      (pathname) =>
        (request.nextUrl.pathname.includes(pathname.route) &&
          request.method === pathname.method) ||
        request.nextUrl.pathname === "/"
    )
  ) {
    return response;
  }

  const token =
    request.cookies.has("session") && request.cookies.get("session").value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
  let userId: number;
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: number };
    userId = decoded.data;
  } catch (jwtError) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  response.headers.set("user-id", String(userId));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.png$).*)",
    "/api/((?!posts$|posts/\\d+/likes$).*)",
  ],
};
