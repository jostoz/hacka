import type { NextAuthConfig } from 'next-auth';

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
      if (isApiRoute) return isLoggedIn;
      
      // Permitir rutas públicas
      if (isPublicRoute) return true;
      
      // Requerir autenticación para todas las demás rutas
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
