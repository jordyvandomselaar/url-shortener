import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { urlService } from '../services/url.service.js';
import { analyticsService } from '../lib/analytics.js';

interface RedirectParams {
  shortCode: string;
}

export async function registerRedirectRoutes(fastify: FastifyInstance) {
  // Short code redirect handler - MUST be registered last to avoid conflicts
  fastify.get<{ Params: RedirectParams }>('/:shortCode', async (request: FastifyRequest<{ Params: RedirectParams }>, reply: FastifyReply) => {
    const { shortCode } = request.params;

    // Try to find URL first
    let url = await urlService.getUrlByShortCode(shortCode);
    let targetUrl: string;
    let isVariant = false;
    let utmParams: Record<string, string> = {};

    if (url) {
      targetUrl = url.longUrl;
      // Increment click count
      await urlService.incrementUrlClicks(shortCode);
    } else {
      // Try to find variant
      const variant = await urlService.getUrlVariantByShortCode(shortCode);

      if (!variant) {
        return reply.code(404).send({ error: 'Short URL not found' });
      }

      isVariant = true;
      targetUrl = variant.url.longUrl;

      // Build UTM parameters
      if (variant.utmSource) utmParams.utm_source = variant.utmSource;
      if (variant.utmMedium) utmParams.utm_medium = variant.utmMedium;
      if (variant.utmCampaign) utmParams.utm_campaign = variant.utmCampaign;
      if (variant.utmTerm) utmParams.utm_term = variant.utmTerm;
      if (variant.utmContent) utmParams.utm_content = variant.utmContent;

      // Append UTM params to target URL
      const urlObj = new URL(targetUrl);
      Object.entries(utmParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });
      targetUrl = urlObj.toString();

      // Increment variant click count
      await urlService.incrementVariantClicks(shortCode);
    }

    // Track analytics
    await analyticsService.trackPageView({
      url: targetUrl,
      title: shortCode,
      referrer: request.headers.referer,
      data: {
        shortCode,
        isVariant,
        ...utmParams,
      },
    });

    // Perform 301 permanent redirect
    return reply.code(301).header('Location', targetUrl).send();
  });
}
