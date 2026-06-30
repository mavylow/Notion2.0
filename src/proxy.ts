import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/api")) {
    return handleApiRoute(request);
  } else {
    return handlePagesRoute(request);
  }
}

function handleApiRoute(request: NextRequest): NextResponse {
  const PUBLIC_API_ROUTES = [
    { route: /^\/api\/signin$/, method: "POST" },
    { route: /^\/api\/signup$/, method: "POST" },
    { route: /^\/api\/login$/, method: "POST" },
    { route: /^\/api\/posts$/, method: "GET" },
    { route: /^\/api\/posts\/\d+\/likes$/, method: "GET" },
    { route: /^\/api\/profile\/\d+$/, method: "GET" },
    { route: /^\/api\/users\/\d+$/, method: "GET" },
  ];

  if (
    PUBLIC_API_ROUTES.some(
      (r) =>
        r.route.test(request.nextUrl.pathname) && r.method === request.method
    )
  ) {
    return NextResponse.next();
  }

  const response = checkAuth(request);

  if (response.status === 401) {
    return response;
  }

  return response;
}

function handlePagesRoute(request: NextRequest): NextResponse {
  const PUBLIC_PAGE_ROUTES = [
    { route: /^\/signin$/, method: "GET" },
    { route: /^\/signup$/, method: "GET" },
    { route: /^\/$/, method: "GET" },
  ];

  if (
    PUBLIC_PAGE_ROUTES.some(
      (r) =>
        r.route.test(request.nextUrl.pathname) && r.method === request.method
    )
  ) {
    return NextResponse.next();
  }

  const response = checkAuth(request);

  if (response.status === 401) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return response;
}

function checkAuth(request: NextRequest): NextResponse {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: number };
    const userId = decoded.data;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set("user-id", String(userId));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.png$).*)",
    "/api/:path*",
  ],
};
