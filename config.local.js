// Local development configuration
module.exports = {
  // Auth (required for NextAuth.js)
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'tu-secreto-seguro-aqui',

  // Database (required for Vercel Postgres)
  POSTGRES_URL: 'postgres://default:Zl9T3VrRcKBa@ep-jolly-fog-a4jxx1rf-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require',
  POSTGRES_URL_UNPOOLED: 'postgresql://default:Zl9T3VrRcKBa@ep-jolly-fog-a4jxx1rf.us-east-1.aws.neon.tech/verceldb?sslmode=require',
  PGDATABASE: 'verceldb',
  PGHOST: 'ep-jolly-fog-a4jxx1rf-pooler.us-east-1.aws.neon.tech',
  PGHOST_UNPOOLED: 'ep-jolly-fog-a4jxx1rf.us-east-1.aws.neon.tech',
  PGPASSWORD: 'Zl9T3VrRcKBa',
  PGUSER: 'default',
  POSTGRES_DATABASE: 'verceldb',
  POSTGRES_HOST: 'ep-jolly-fog-a4jxx1rf-pooler.us-east-1.aws.neon.tech',
  POSTGRES_PASSWORD: 'Zl9T3VrRcKBa',
  POSTGRES_PRISMA_URL: 'postgres://default:Zl9T3VrRcKBa@ep-jolly-fog-a4jxx1rf-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require',
  POSTGRES_URL_NON_POOLING: 'postgres://default:Zl9T3VrRcKBa@ep-jolly-fog-a4jxx1rf.us-east-1.aws.neon.tech/verceldb?sslmode=require',
  POSTGRES_URL_NO_SSL: 'postgres://default:Zl9T3VrRcKBa@ep-jolly-fog-a4jxx1rf-pooler.us-east-1.aws.neon.tech/verceldb',
  POSTGRES_USER: 'default',

  // API Keys (optional - para características de AI)
  OPENAI_API_KEY: 'tu-api-key-de-openai',
  
  // Public variables (accesibles en el cliente)
  NEXT_PUBLIC_SHOW_MARKETING: 'true'
}

// En el código del servidor
process.env.NEXTAUTH_URL
process.env.POSTGRES_URL

// En el código del cliente
process.env.NEXT_PUBLIC_VARIABLE // solo para variables públicas