import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.redirect(new URL('/unauthorized', req.url)); // Ou página de erro
  }
  return NextResponse.next();
}

export const config = { matcher: ['/'] }; // Protege a página principal
