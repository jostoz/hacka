'use server';

import { z } from 'zod';
import { hash } from 'bcrypt-ts';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function login(email: string, password: string): Promise<ActionState> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return {
      success: !result?.error,
      error: result?.error,
    };
  } catch (error) {
    return {
      error: 'Error al iniciar sesión',
    };
  }
}

export async function register(email: string, password: string): Promise<ActionState> {
  try {
    const validation = userSchema.safeParse({ email, password });
    if (!validation.success) {
      return {
        error: 'Datos de usuario inválidos',
      };
    }

    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      return {
        error: 'El usuario ya existe',
      };
    }

    const hashedPassword = await hash(password, 10);
    await createUser(email, hashedPassword);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: 'Error al registrar usuario',
    };
  }
}
