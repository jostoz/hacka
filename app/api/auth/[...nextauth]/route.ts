import { AuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { handlers } from '@/lib/auth';

export const authOptions: AuthOptions = {
  // Configuración de NextAuth
  providers: [],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    }
  }
};

export const { GET, POST } = handlers;

export { getServerSession }; 