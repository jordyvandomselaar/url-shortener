import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { urlService } from '../services/url.service.js';
import { userService } from '../services/user.service.js';
import { requireAuth, requireAdmin } from '../lib/session.js';

interface CreateUrlBody {
  longUrl: string;
  customShortCode?: string;
}

interface CreateVariantBody {
  urlId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

interface UpdateUrlBody {
  longUrl: string;
}

interface UpdateUserBody {
  email?: string;
  name?: string;
  password?: string;
}

export async function registerApiRoutes(fastify: FastifyInstance) {
  // URL endpoints
  fastify.get('/api/urls', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const urls = await urlService.getUrlsByUserId(session.userId);
    return { urls };
  });

  fastify.post<{ Body: CreateUrlBody }>('/api/urls', async (request: FastifyRequest<{ Body: CreateUrlBody }>, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const url = await urlService.createUrl({
        longUrl: request.body.longUrl,
        userId: session.userId,
        customShortCode: request.body.customShortCode,
      });
      return { url };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.post<{ Body: CreateVariantBody }>('/api/urls/variants', async (request: FastifyRequest<{ Body: CreateVariantBody }>, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const variant = await urlService.createUrlVariant(request.body);
      return { variant };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.put<{ Params: { id: string }; Body: UpdateUrlBody }>('/api/urls/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateUrlBody }>, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const url = await urlService.updateUrl(request.params.id, request.body.longUrl);
      return { url };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.delete<{ Params: { id: string } }>('/api/urls/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      await urlService.deleteUrl(request.params.id);
      return { success: true };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.delete<{ Params: { id: string } }>('/api/urls/variants/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      await urlService.deleteUrlVariant(request.params.id);
      return { success: true };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  // User endpoints (admin only)
  fastify.get('/api/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await requireAdmin(request, reply);
    if (!session) return;

    const users = await userService.getAllUsers();
    return { users };
  });

  fastify.get<{ Params: { id: string } }>('/api/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await requireAdmin(request, reply);
    if (!session) return;

    const user = await userService.getUserById(request.params.id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return { user };
  });

  fastify.put<{ Params: { id: string }; Body: UpdateUserBody }>('/api/users/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserBody }>, reply: FastifyReply) => {
    const session = await requireAdmin(request, reply);
    if (!session) return;

    try {
      const user = await userService.updateUser(request.params.id, request.body);
      return { user };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.delete<{ Params: { id: string } }>('/api/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await requireAdmin(request, reply);
    if (!session) return;

    try {
      await userService.deleteUser(request.params.id);
      return { success: true };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.post<{ Params: { id: string } }>('/api/users/:id/toggle-admin', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = await requireAdmin(request, reply);
    if (!session) return;

    try {
      const user = await userService.toggleAdmin(request.params.id);
      return { user };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });
}
