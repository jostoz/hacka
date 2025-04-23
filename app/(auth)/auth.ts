import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createHash } from 'node:crypto'
import { z } from 'zod'

import { authConfig } from './auth.config'
import { getUser } from '@/lib/db/queries'
import { DUMMY_PASSWORD } from '@/lib/constants'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const users = await getUser(email)

          if (users.length === 0) {
            // Simulate password check timing
            createHash('sha256').update(password).digest('hex')
            return null
          }

          const [user] = users

          if (!user.password) {
            // Simulate password check timing
            createHash('sha256').update(password).digest('hex')
            return null
          }

          const passwordHash = createHash('sha256').update(password).digest('hex')
          const passwordsMatch = passwordHash === user.password

          if (!passwordsMatch) return null

          return {
            id: user.id,
            email: user.email,
          }
        }

        return null
      },
    }),
  ],
})
