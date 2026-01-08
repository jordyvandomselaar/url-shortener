import { FastifyRequest, FastifyReply } from 'fastify';

const SESSION_COOKIE_NAME = 'session';

export interface SessionData {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function setSession(reply: FastifyReply, data: SessionData) {
  const sessionData = JSON.stringify(data);
  const encoded = Buffer.from(sessionData).toString('base64');

  reply.setCookie(SESSION_COOKIE_NAME, encoded, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function getSession(request: FastifyRequest): SessionData | null {
  const cookie = request.cookies[SESSION_COOKIE_NAME];

  if (!cookie) {
    return null;
  }

  try {
    const decoded = Buffer.from(cookie, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export function clearSession(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const session = getSession(request);

  if (!session) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  return session;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const session = await requireAuth(request, reply);

  if (session && !session.isAdmin) {
    return reply.code(403).send({ error: 'Forbidden' });
  }

  return session;
}
