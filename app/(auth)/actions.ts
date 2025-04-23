'use server';

import { z } from 'zod';
import { hash } from 'bcryptjs';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ActionState = {
  error?: string;
  success?: boolean;
  status: 'idle' | 'failed' | 'invalid_data' | 'success';
};

export async function login(formData: FormData): Promise<ActionState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: result.error,
        status: 'failed'
      };
    }

    return {
      success: true,
      status: 'success'
    };
  } catch (error) {
    return {
      error: 'Error al iniciar sesión',
      success: false,
      status: 'failed'
    };
  }
}

export async function register(email: string, password: string): Promise<ActionState> {
  try {
    const validation = userSchema.safeParse({ email, password });
    if (!validation.success) {
      return {
        error: 'Datos de usuario inválidos',
        success: false,
        status: 'invalid_data'
      };
    }

    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      return {
        error: 'El usuario ya existe',
        success: false,
        status: 'failed'
      };
    }

    const hashedPassword = await hash(password, 10);
    await createUser(email, hashedPassword);

    return {
      success: true,
      status: 'success'
    };
  } catch (error) {
    return {
      error: 'Error al registrar usuario',
      success: false,
      status: 'failed'
    };
  }
}
