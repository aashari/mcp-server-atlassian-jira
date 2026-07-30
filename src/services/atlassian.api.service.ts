import { Logger } from '../utils/logger.util.js';

const serviceLogger = Logger.forContext('services/atlassian.api.service.ts');

export class AtlassianApiService {
  private baseUrl: string;
  private email: string;
  private apiToken: string;

  constructor() {
    const siteName = process.env.ATLASSIAN_SITE_NAME;
    const email = process.env.ATLASSIAN_USER_EMAIL;
    const apiToken = process.env.ATLASSIAN_API_TOKEN;

    if (!siteName) throw new Error('ATLASSIAN_SITE_NAME environment variable is required');
    if (!email) throw new Error('ATLASSIAN_USER_EMAIL environment variable is required');
    if (!apiToken) throw new Error('ATLASSIAN_API_TOKEN environment variable is required');

    // NOTE: Scoped API tokens use a different URL format than regular tokens.
    // Regular tokens: https://{siteName}.atlassian.net
    // Scoped tokens:  https://api.atlassian.com/ex/jira/{siteName}
    // Set ATLASSIAN_BASE_URL to override the default when using scoped tokens.
    this.baseUrl = process.env.ATLASSIAN_BASE_URL || `https://${siteName}.atlassian.net`;

    this.email = email;
    this.apiToken = apiToken;

    serviceLogger.debug(`Initialized with base URL: ${this.baseUrl}`);
  }

  private getHeaders(): Record<string, string> {
    const credentials = `${this.email}:${this.apiToken}`;
    const auth = Buffer.from(credentials).toString('base64');

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}`,
    };
  }

  async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      queryParams?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const methodLogger = serviceLogger.forMethod('request');
    const { method = 'GET', body, queryParams } = options;

    // Build URL with query parameters
    const url = new URL(path, this.baseUrl);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    methodLogger.debug(`${method} ${url.toString()}`);

    const fetchOptions: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      methodLogger.error(`API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    methodLogger.debug(`Request completed successfully`);
    return data as T;
  }

  async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', queryParams });
  }

  async post<T>(path: string, body?: unknown, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, queryParams });
  }

  async put<T>(path: string, body?: unknown, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, queryParams });
  }

  async patch<T>(path: string, body?: unknown, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, queryParams });
  }

  async delete<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', queryParams });
  }
}
