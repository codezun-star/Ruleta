import {defineConfig} from 'drizzle-kit';
import {sanitizeDatabaseUrl} from './src/lib/db/url';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {url: sanitizeDatabaseUrl(process.env.DATABASE_URL ?? '')},
  strict: true
});
