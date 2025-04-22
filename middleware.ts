import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Proteger todas las rutas excepto las públicas
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|login|register).*)',
    '/api/:path*', // Proteger todas las rutas API
  ],
};
