import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { RouteMatch } from "./interfaces";

const SECRET_KEY = process.env.SECRET_KEY;

const PUBLIC_API_ROUTES: RouteMatch[] = [
  { route: /^\/api\/signup$/, method: "POST" },
  { route: /^\/api\/login$/, method: "POST" },
  { route: /^\/api\/posts$/, method: "GET" },
  { route: /^\/api\/posts\/\d+\/likes$/, method: "GET" },
  { route: /^\/api\/profile\/\d+$/, method: "GET" },
  { route: /^\/api\/users\/\d+$/, method: "GET" },
];

const PUBLIC_PAGE_ROUTES: RouteMatch[] = [
  { route: /^\/signin$/, method: "GET" },
  { route: /^\/signup$/, method: "GET" },
  { route: /^\/$/, method: "GET" },
];

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/api")) {
    return handleApiRoute(request);
  } else {
    return handlePagesRoute(request);
  }
}

function handleApiRoute(request: NextRequest): NextResponse {
  if (isRouteMatch(PUBLIC_API_ROUTES, request)) {
    return NextResponse.next();
  }

  const response = authenticateResponse(request);

  if (response === null) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  return response;
}

function handlePagesRoute(request: NextRequest): NextResponse {
  if (isRouteMatch(PUBLIC_PAGE_ROUTES, request)) {
    return NextResponse.next();
  }

  const response = authenticateResponse(request);

  if (response === null) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return response;
}

function authenticateResponse(request: NextRequest): NextResponse {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: number };
    const userId = decoded.data;

    if (!userId) {
      return null;
    }

    const newHeaders = new Headers(request.headers);
    newHeaders.set("user-id", String(userId));

    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    });
  } catch {
    return null;
  }
}

function isRouteMatch(routes: RouteMatch[], request: NextRequest) {
  return routes.some(
    (r) => r.route.test(request.nextUrl.pathname) && r.method === request.method
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.png$).*)",
    "/api/:path*",
  ],
};
