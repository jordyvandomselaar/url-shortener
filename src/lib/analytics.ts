import { config } from '../config.js';

export interface TrackEventParams {
  url: string;
  title?: string;
  referrer?: string;
  data?: Record<string, any>;
}

export class AnalyticsService {
  private websiteId: string;
  private apiEndpoint: string;
  private enabled: boolean;

  constructor() {
    this.websiteId = config.umami.websiteId;
    this.apiEndpoint = config.umami.apiEndpoint;
    this.enabled = !!(this.websiteId && this.apiEndpoint);
  }

  async trackPageView(params: TrackEventParams) {
    if (!this.enabled) {
      return;
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/api/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'URL Shortener',
        },
        body: JSON.stringify({
          type: 'event',
          payload: {
            website: this.websiteId,
            url: params.url,
            title: params.title,
            referrer: params.referrer,
            data: params.data,
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to track analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
