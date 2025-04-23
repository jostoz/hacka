import { generateDummyPassword } from './db/utils'

export const isProductionEnvironment = process.env.NODE_ENV === 'production'

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.PLAYWRIGHT ||
  process.env.CI_PLAYWRIGHT
)

// Generate a dummy password hash for timing attack prevention
// We use a default hash initially, then update it asynchronously
export let DUMMY_PASSWORD = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

// Update the dummy password asynchronously
generateDummyPassword().then(hash => {
  DUMMY_PASSWORD = hash
})
