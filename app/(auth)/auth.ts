import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession, } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';

// Custom error types for authentication
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Type definitions
interface AuthUser {
  id: string;
  email: string;
  password?: string;
}

// Extend the built-in session type
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

// Type guard for AuthUser
function isAuthUser(user: unknown): user is AuthUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    typeof (user as AuthUser).id === 'string' &&
    typeof (user as AuthUser).email === 'string'
  );
}

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Credentials = z.infer<typeof credentialsSchema>;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          // Validate credentials format
          const validatedCredentials = credentialsSchema.parse(credentials);
          
          // Get user from database
          const users = await getUser(validatedCredentials.email);
          if (users.length === 0) {
            throw new AuthenticationError('Invalid credentials');
          }

          const user = users[0];
          if (!user.password) {
            throw new AuthenticationError('User has no password set');
          }

          // Verify password
          const isValidPassword = await compare(
            validatedCredentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new AuthenticationError('Invalid credentials');
          }

          // Validate user data with type guard
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
          };

          if (!isAuthUser(authUser)) {
            throw new ValidationError('Invalid user data structure');
          }

          return authUser;
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError('Invalid credentials format');
          }
          if (error instanceof AuthenticationError || error instanceof ValidationError) {
            throw error;
          }
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && isAuthUser(user)) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
