import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	getAtlassianCredentials,
	AtlassianCredentials,
	TransportResponse,
} from '../utils/transport.util.js';
import { createAuthMissingError, McpError } from '../utils/error.util.js';

/**
 * @namespace VendorAtlassianApiService
 * @description Service layer for interacting with the Atlassian Jira API.
 *              Responsible for credentials validation, path normalization,
 *              and making raw API requests via the transport utility.
 *
 * This service provides a thin wrapper around fetchAtlassian() to maintain
 * consistent layered architecture across all MCP servers:
 * - Transport (transport.util.ts): Raw HTTP operations
 * - Service (this file): API-specific logic, credentials, path handling
 * - Controller: Business logic, filtering, formatting
 */

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	'services/vendor.atlassian.api.service.ts',
);

// Log service initialization
serviceLogger.debug('Jira API service initialized');

/**
 * Supported HTTP methods for API requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
	method?: HttpMethod;
	queryParams?: Record<string, string>;
	body?: Record<string, unknown>;
}

/**
 * Validates and returns Atlassian credentials
 * @throws {McpError} If credentials are missing
 * @returns {AtlassianCredentials} Valid credentials
 */
export function validateCredentials(): AtlassianCredentials {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.api.service.ts',
		'validateCredentials',
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		methodLogger.error('Missing Atlassian credentials');
		throw createAuthMissingError();
	}

	methodLogger.debug('Credentials validated successfully');
	return credentials;
}

/**
 * Normalizes the API path by ensuring it starts with /
 * @param path - The raw path provided by the user
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
	let normalizedPath = path;
	if (!normalizedPath.startsWith('/')) {
		normalizedPath = '/' + normalizedPath;
	}
	return normalizedPath;
}

/**
 * Appends query parameters to a path
 * @param path - The base path
 * @param queryParams - Optional query parameters
 * @returns Path with query string appended
 */
export function appendQueryParams(
	path: string,
	queryParams?: Record<string, string>,
): string {
	if (!queryParams || Object.keys(queryParams).length === 0) {
		return path;
	}
	const queryString = new URLSearchParams(queryParams).toString();
	return path + (path.includes('?') ? '&' : '?') + queryString;
}

/**
 * Makes a generic API request to the Jira API
 *
 * @param path - API endpoint path (e.g., '/rest/api/3/project')
 * @param options - Request options including method, queryParams, and body
 * @returns Promise resolving to the raw API response
 * @throws {McpError} If credentials are missing or API request fails
 *
 * @example
 * // GET request
 * const projects = await request('/rest/api/3/project', {
 *   method: 'GET',
 *   queryParams: { maxResults: '10' }
 * });
 *
 * @example
 * // POST request
 * const issue = await request('/rest/api/3/issue', {
 *   method: 'POST',
 *   body: { fields: { project: { key: 'PROJ' }, summary: 'New Issue', ... } }
 * });
 */
export async function request<T = unknown>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<TransportResponse<T>> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.api.service.ts',
		'request',
	);

	const method = options.method || 'GET';
	methodLogger.debug(`Making ${method} request to ${path}`);

	try {
		// Validate credentials
		const credentials = validateCredentials();

		// Normalize path and append query params
		let normalizedPath = normalizePath(path);
		normalizedPath = appendQueryParams(normalizedPath, options.queryParams);

		methodLogger.debug(`Normalized path: ${normalizedPath}`);

		// Prepare fetch options
		const fetchOptions: {
			method: HttpMethod;
			body?: unknown;
		} = {
			method,
		};

		// Add body for methods that support it
		if (options.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
			fetchOptions.body = options.body;
		}

		// Make the API call
		const response = await fetchAtlassian<T>(
			credentials,
			normalizedPath,
			fetchOptions,
		);

		methodLogger.debug('Successfully received response from Jira API');
		return response;
	} catch (error) {
		methodLogger.error(
			`Service error during ${method} request to ${path}`,
			error,
		);

		// Rethrow McpErrors as-is
		if (error instanceof McpError) {
			throw error;
		}

		// This shouldn't happen as fetchAtlassian wraps all errors
		throw error;
	}
}

/**
 * Makes a GET request to the Jira API
 * @param path - API endpoint path
 * @param queryParams - Optional query parameters
 * @returns Promise resolving to the API response with rawResponsePath
 */
export async function get<T = unknown>(
	path: string,
	queryParams?: Record<string, string>,
): Promise<TransportResponse<T>> {
	return request<T>(path, { method: 'GET', queryParams });
}

/**
 * Makes a POST request to the Jira API
 * @param path - API endpoint path
 * @param body - Request body
 * @param queryParams - Optional query parameters
 * @returns Promise resolving to the API response with rawResponsePath
 */
export async function post<T = unknown>(
	path: string,
	body?: Record<string, unknown>,
	queryParams?: Record<string, string>,
): Promise<TransportResponse<T>> {
	return request<T>(path, { method: 'POST', body, queryParams });
}

/**
 * Makes a PUT request to the Jira API
 * @param path - API endpoint path
 * @param body - Request body
 * @param queryParams - Optional query parameters
 * @returns Promise resolving to the API response with rawResponsePath
 */
export async function put<T = unknown>(
	path: string,
	body?: Record<string, unknown>,
	queryParams?: Record<string, string>,
): Promise<TransportResponse<T>> {
	return request<T>(path, { method: 'PUT', body, queryParams });
}

/**
 * Makes a PATCH request to the Jira API
 * @param path - API endpoint path
 * @param body - Request body
 * @param queryParams - Optional query parameters
 * @returns Promise resolving to the API response with rawResponsePath
 */
export async function patch<T = unknown>(
	path: string,
	body?: Record<string, unknown>,
	queryParams?: Record<string, string>,
): Promise<TransportResponse<T>> {
	return request<T>(path, { method: 'PATCH', body, queryParams });
}

/**
 * Makes a DELETE request to the Jira API
 * @param path - API endpoint path
 * @param queryParams - Optional query parameters
 * @returns Promise resolving to the API response with rawResponsePath
 */
export async function del<T = unknown>(
	path: string,
	queryParams?: Record<string, string>,
): Promise<TransportResponse<T>> {
	return request<T>(path, { method: 'DELETE', queryParams });
}

export default {
	request,
	get,
	post,
	put,
	patch,
	del,
	validateCredentials,
	normalizePath,
	appendQueryParams,
};
