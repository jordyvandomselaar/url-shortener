import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/urlshortener',
  baseUrl: process.env.BASE_URL || 'jmd.to',
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret',
  umami: {
    websiteId: process.env.UMAMI_WEBSITE_ID || '',
    apiEndpoint: process.env.UMAMI_API_ENDPOINT || '',
  },
};
