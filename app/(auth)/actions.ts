'use server'

import { z } from 'zod'
import { createUser, getUser } from '@/lib/db/queries'
import { signIn } from './auth'

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type ActionState = {
  status: 'idle' | 'failed' | 'invalid_data' | 'success'
}

export async function login(formData: FormData): Promise<ActionState> {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { status: 'success' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' }
    }
    return { status: 'failed' }
  }
}

export async function register(formData: FormData): Promise<ActionState> {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const [user] = await getUser(validatedData.email)

    if (user) {
      return { status: 'failed' }
    }

    await createUser(validatedData.email, validatedData.password)
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { status: 'success' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' }
    }
    return { status: 'failed' }
  }
}
