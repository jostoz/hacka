import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as jose from 'jose';

export interface User {
  id: string;
  email: string;
}

export interface Session {
  user?: User;
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string
      }
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

interface SignOutOptions {
  redirectTo?: string;
}

export async function signOut(options?: SignOutOptions) {
  const cookieStore = await cookies();
  
  // Remove the token by setting it to an empty string and expiring it
  cookieStore.set('token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  // Revalidate all pages that might depend on the authentication state
  revalidatePath('/', 'layout');
  
  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }
}

interface SignInOptions {
  email: string;
  password: string;
  redirect?: boolean | string;
}

export async function signIn(provider: 'credentials', options: SignInOptions) {
  try {
    const cookieStore = await cookies();
    
    // Here you would typically validate credentials against your database
    // and generate a JWT token. For now, we'll create a simple token
    // with the user's email
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ email: options.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(options.email) // Using email as subject for now
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Revalidate all pages that might depend on the authentication state
    revalidatePath('/', 'layout');

    if (options.redirect && typeof options.redirect === 'string') {
      redirect(options.redirect);
    }

    return { ok: true };
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
}
