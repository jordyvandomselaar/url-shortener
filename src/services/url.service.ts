import { prisma } from '../lib/prisma.js';
import { generateShortCode } from '../lib/shortcode.js';

export interface CreateUrlInput {
  longUrl: string;
  userId: string;
  customShortCode?: string;
}

export interface CreateUrlVariantInput {
  urlId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export class UrlService {
  async createUrl(input: CreateUrlInput) {
    let shortCode = input.customShortCode;

    if (!shortCode) {
      // Generate a unique short code
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        shortCode = generateShortCode();
        const existing = await prisma.url.findUnique({
          where: { shortCode },
        });

        if (!existing) {
          break;
        }

        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique short code');
      }
    } else {
      // Check if custom short code is already taken
      const existing = await prisma.url.findUnique({
        where: { shortCode },
      });

      if (existing) {
        throw new Error('Short code already taken');
      }
    }

    return prisma.url.create({
      data: {
        shortCode: shortCode!,
        longUrl: input.longUrl,
        userId: input.userId,
      },
      include: {
        variants: true,
      },
    });
  }

  async createUrlVariant(input: CreateUrlVariantInput) {
    // Generate a unique short code for the variant
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      shortCode = generateShortCode();
      const [existingUrl, existingVariant] = await Promise.all([
        prisma.url.findUnique({ where: { shortCode } }),
        prisma.urlVariant.findUnique({ where: { shortCode } }),
      ]);

      if (!existingUrl && !existingVariant) {
        break;
      }

      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Failed to generate unique short code');
    }

    return prisma.urlVariant.create({
      data: {
        shortCode: shortCode!,
        urlId: input.urlId,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmTerm: input.utmTerm,
        utmContent: input.utmContent,
      },
    });
  }

  async getUrlByShortCode(shortCode: string) {
    const url = await prisma.url.findUnique({
      where: { shortCode },
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

    return url;
  }

  async getUrlVariantByShortCode(shortCode: string) {
    const variant = await prisma.urlVariant.findUnique({
      where: { shortCode },
      include: {
        url: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return variant;
  }

  async getUrlsByUserId(userId: string) {
    return prisma.url.findMany({
      where: { userId },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUrl(id: string, longUrl: string) {
    return prisma.url.update({
      where: { id },
      data: { longUrl },
    });
  }

  async deleteUrl(id: string) {
    return prisma.url.delete({
      where: { id },
    });
  }

  async deleteUrlVariant(id: string) {
    return prisma.urlVariant.delete({
      where: { id },
    });
  }

  async incrementUrlClicks(shortCode: string) {
    return prisma.url.update({
      where: { shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  async incrementVariantClicks(shortCode: string) {
    return prisma.urlVariant.update({
      where: { shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }
}

export const urlService = new UrlService();
