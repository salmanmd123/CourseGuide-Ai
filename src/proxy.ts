
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

async function hasValidSession(
  request: NextRequest
): Promise<boolean> {
  if (!secret) return false;

  const token = request.cookies.get("session")?.value;
  if (!token) return false;

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return typeof payload.userId === "number";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  const isPublicPage =
    isHomePage || isLoginPage || isRegisterPage;

  const authenticated = await hasValidSession(request);

  if (
    authenticated &&
    (isHomePage || isLoginPage || isRegisterPage)
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
