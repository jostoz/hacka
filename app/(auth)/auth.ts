import { compare } from 'bcrypt-ts';
import NextAuth, { 
  type DefaultSession, 
  type User as NextAuthUser
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '../../lib/db';
import { user } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  // Instead of extending NextAuthUser directly, we define additional properties
  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
  }
}

interface DbUser {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Credentials = z.infer<typeof credentialsSchema>;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
} = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new AuthenticationError('Missing credentials');
        }

        try {
          const validatedCredentials = credentialsSchema.parse(credentials);

          const foundUser = await db.query.user.findFirst({
            where: eq(user.email, validatedCredentials.email),
          }) as DbUser | undefined;

          if (!foundUser || !foundUser.password) {
            throw new AuthenticationError('Invalid credentials');
          }

          const isValidPassword = await compare(validatedCredentials.password, foundUser.password);

          if (!isValidPassword) {
            throw new AuthenticationError('Invalid credentials');
          }

          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
          };
        } catch (error) {
          if (error instanceof AuthenticationError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: JWT, user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: DefaultSession, token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

