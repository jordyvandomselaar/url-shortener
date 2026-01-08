import { FastifyInstance } from 'fastify';
import { registerAuthRoutes } from './auth.routes.js';
import { registerApiRoutes } from './api.routes.js';
import { registerRedirectRoutes } from './redirect.routes.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Root route - redirect to dashboard
  fastify.get('/', async (request, reply) => {
    return reply.redirect('/public/dashboard.html');
  });

  // Register auth routes
  await registerAuthRoutes(fastify);

  // Register API routes
  await registerApiRoutes(fastify);

  // Register redirect routes (must be last to avoid conflicts)
  await registerRedirectRoutes(fastify);
}
