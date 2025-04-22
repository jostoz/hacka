import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  providers: [], // configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith('/api');
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isPublicRoute = [
        '/login',
        '/register',
        '/',
        '/public'
      ].includes(nextUrl.pathname);
      
      // Permitir rutas de autenticación
      if (isAuthRoute) return true;
      
      // Proteger rutas API (excepto auth)
      if (isApiRoute) {
        if (isLoggedIn) return true;
        // Si no está logueado, devolver 401 en lugar de redirigir
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
      }
      
      // Permitir rutas públicas
      if (isPublicRoute) return true;
      
      // Para rutas de página, redirigir si no está logueado
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
