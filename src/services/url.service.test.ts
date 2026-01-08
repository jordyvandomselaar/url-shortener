import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UrlService } from './url.service.js';

// Mock Prisma client
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    url: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    urlVariant: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('UrlService', () => {
  let urlService: UrlService;

  beforeEach(() => {
    urlService = new UrlService();
    vi.clearAllMocks();
  });

  describe('createUrl', () => {
    it('should create a URL with generated short code', async () => {
      const mockUrl = {
        id: '1',
        shortCode: 'abc123',
        longUrl: 'https://example.com',
        userId: 'user1',
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [],
      };

      const { prisma } = await import('../lib/prisma.js');
      vi.mocked(prisma.url.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.url.create).mockResolvedValue(mockUrl);

      const result = await urlService.createUrl({
        longUrl: 'https://example.com',
        userId: 'user1',
      });

      expect(result).toEqual(mockUrl);
      expect(prisma.url.create).toHaveBeenCalled();
    });

    it('should create a URL with custom short code', async () => {
      const mockUrl = {
        id: '1',
        shortCode: 'custom',
        longUrl: 'https://example.com',
        userId: 'user1',
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [],
      };

      const { prisma } = await import('../lib/prisma.js');
      vi.mocked(prisma.url.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.url.create).mockResolvedValue(mockUrl);

      const result = await urlService.createUrl({
        longUrl: 'https://example.com',
        userId: 'user1',
        customShortCode: 'custom',
      });

      expect(result.shortCode).toBe('custom');
    });

    it('should throw error if custom short code is taken', async () => {
      const { prisma } = await import('../lib/prisma.js');
      vi.mocked(prisma.url.findUnique).mockResolvedValue({
        id: '1',
        shortCode: 'taken',
        longUrl: 'https://example.com',
        userId: 'user1',
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        urlService.createUrl({
          longUrl: 'https://example.com',
          userId: 'user1',
          customShortCode: 'taken',
        })
      ).rejects.toThrow('Short code already taken');
    });
  });

  describe('getUrlByShortCode', () => {
    it('should return URL by short code', async () => {
      const mockUrl = {
        id: '1',
        shortCode: 'abc123',
        longUrl: 'https://example.com',
        userId: 'user1',
        clicks: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [],
        user: {
          id: 'user1',
          email: 'user@example.com',
          name: 'Test User',
        },
      };

      const { prisma } = await import('../lib/prisma.js');
      vi.mocked(prisma.url.findUnique).mockResolvedValue(mockUrl);

      const result = await urlService.getUrlByShortCode('abc123');

      expect(result).toEqual(mockUrl);
      expect(prisma.url.findUnique).toHaveBeenCalledWith({
        where: { shortCode: 'abc123' },
        include: {
          variants: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  });
});
