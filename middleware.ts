import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*'],
};

const unauthorized = new NextResponse('Unauthorized', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
});

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return unauthorized;

  let decoded: string;
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return unauthorized;
  }

  const [username, password] = decoded.split(':');
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  if (
    validUser === undefined ||
    validPass === undefined ||
    username !== validUser ||
    password !== validPass
  ) {
    return unauthorized;
  }

  return NextResponse.next();
}
