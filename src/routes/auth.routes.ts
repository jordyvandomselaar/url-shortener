import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service.js';
import { setSession, clearSession, getSession } from '../lib/session.js';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function registerAuthRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post<{ Body: RegisterBody }>('/api/auth/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      const user = await authService.register(request.body);
      setSession(reply, {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      return { success: true, user };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  // Login
  fastify.post<{ Body: LoginBody }>('/api/auth/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const user = await authService.login(request.body);
      setSession(reply, {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      return { success: true, user };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // Logout
  fastify.post('/api/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    clearSession(reply);
    return { success: true };
  });

  // Get current user
  fastify.get('/api/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = getSession(request);
    if (!session) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
    const user = await authService.getUserById(session.userId);
    return { user };
  });
}
