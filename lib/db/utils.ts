import { hash } from 'bcryptjs'

export const generateDummyPassword = async () => {
  // Generate a secure dummy password hash
  // This is used to prevent timing attacks when a user doesn't exist
  return await hash('dummy-password-for-timing-attack-prevention', 10)
}
