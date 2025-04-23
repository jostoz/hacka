import { compare } from 'bcryptjs';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { z } from 'zod';

// Schema de validación para las credenciales
const credentialsSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials) {
        try {
          // Validar credenciales
          const validatedCredentials = credentialsSchema.parse(credentials);
          const { email, password } = validatedCredentials;

          // Buscar usuario
          const users = await getUser(email);
          if (users.length === 0) {
            return null;
          }

          const user = users[0];
          if (!user.password) {
            console.error('Usuario sin contraseña configurada');
            return null;
          }

          // Verificar contraseña
          const passwordsMatch = await compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }
          
          // Devolver solo los datos necesarios
          return {
            id: user.id,
            email: user.email,
            name: user.email.split('@')[0], // opcional
          };
        } catch (error) {
          console.error('Error de autorización:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session as ExtendedSession;
    },
  },
});

