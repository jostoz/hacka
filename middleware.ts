import { auth } from './app/(auth)/auth'

export default auth

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|login|register).*)',
    '/api/:path*',
  ],
};
