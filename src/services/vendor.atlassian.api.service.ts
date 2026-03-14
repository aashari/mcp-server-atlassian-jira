import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	fetchAtlassianMultipart,
	fetchAtlassianBinary,
	getAtlassianCredentials,
	AtlassianCredentials,
	TransportResponse,
} from '../utils/transport.util.js';
import {
	createAuthMissingError,
	createApiError,
	McpError,
} from '../utils/error.util.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

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

/**
 * MIME type mapping for common file extensions
 */
const MIME_TYPES: Record<string, string> = {
	// Images
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.bmp': 'image/bmp',
	'.ico': 'image/x-icon',
	// Documents
	'.pdf': 'application/pdf',
	'.doc': 'application/msword',
	'.docx':
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.xls': 'application/vnd.ms-excel',
	'.xlsx':
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'.ppt': 'application/vnd.ms-powerpoint',
	'.pptx':
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	// Text
	'.txt': 'text/plain',
	'.csv': 'text/csv',
	'.json': 'application/json',
	'.xml': 'application/xml',
	'.html': 'text/html',
	'.htm': 'text/html',
	'.md': 'text/markdown',
	'.log': 'text/plain',
	// Archives
	'.zip': 'application/zip',
	'.tar': 'application/x-tar',
	'.gz': 'application/gzip',
	'.rar': 'application/vnd.rar',
	'.7z': 'application/x-7z-compressed',
	// Code
	'.js': 'text/javascript',
	'.ts': 'text/typescript',
	'.py': 'text/x-python',
	'.java': 'text/x-java-source',
	'.c': 'text/x-c',
	'.cpp': 'text/x-c++',
	'.h': 'text/x-c',
	'.css': 'text/css',
	'.sql': 'text/x-sql',
	'.sh': 'application/x-sh',
	// Other
	'.eml': 'message/rfc822',
};

/**
 * Get MIME type from file extension
 * @param filename - The filename to get MIME type for
 * @returns MIME type string
 */
function getMimeType(filename: string): string {
	const ext = path.extname(filename).toLowerCase();
	return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Attachment metadata response from Jira API
 */
interface AttachmentMetadata {
	id: string;
	filename: string;
	content: string; // URL to download the attachment
	mimeType: string;
	size: number;
}

/**
 * Result of attachment upload
 */
export interface AttachmentResult {
	id: string;
	filename: string;
	mimeType: string;
	size: number;
	self: string;
}

/**
 * Result of attachment download
 */
export interface DownloadResult {
	filePath: string;
	filename: string;
	mimeType: string;
	size: number;
}

/**
 * Upload a file to a Jira issue as an attachment
 *
 * @param issueIdOrKey - The issue ID or key to attach the file to
 * @param fileBuffer - The file content as a Buffer
 * @param fileName - The name of the file
 * @param mimeType - Optional MIME type (will be detected from extension if not provided)
 * @returns Promise resolving to the attachment metadata
 * @throws {McpError} If credentials are missing or API request fails
 */
export async function attachFile(
	issueIdOrKey: string,
	fileBuffer: Buffer,
	fileName: string,
	mimeType?: string,
): Promise<TransportResponse<AttachmentResult[]>> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.api.service.ts',
		'attachFile',
	);

	methodLogger.debug(`Attaching file to issue ${issueIdOrKey}`, {
		fileName,
		fileSize: fileBuffer.length,
	});

	try {
		const credentials = validateCredentials();
		const detectedMimeType = mimeType || getMimeType(fileName);
		const attachPath = `/rest/api/3/issue/${issueIdOrKey}/attachments`;

		methodLogger.debug(`Using MIME type: ${detectedMimeType}`);

		const response = await fetchAtlassianMultipart<AttachmentResult[]>(
			credentials,
			attachPath,
			fileBuffer,
			fileName,
			detectedMimeType,
		);

		methodLogger.debug('Successfully attached file', {
			attachmentCount: response.data?.length || 0,
		});

		return response;
	} catch (error) {
		methodLogger.error(
			`Failed to attach file to issue ${issueIdOrKey}`,
			error,
		);

		if (error instanceof McpError) {
			throw error;
		}

		throw error;
	}
}

/**
 * Download an attachment from Jira to a local file
 *
 * @param attachmentId - The attachment ID to download
 * @param outputPath - Optional path where to save the file (defaults to temp directory)
 * @returns Promise resolving to download result with file path
 * @throws {McpError} If credentials are missing or API request fails
 */
export async function downloadAttachment(
	attachmentId: string,
	outputPath?: string,
): Promise<DownloadResult> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.api.service.ts',
		'downloadAttachment',
	);

	methodLogger.debug(`Downloading attachment ${attachmentId}`, { outputPath });

	try {
		const credentials = validateCredentials();

		// Step 1: Get attachment metadata to find the content URL
		const metadataPath = `/rest/api/3/attachment/${attachmentId}`;
		const metadataResponse = await fetchAtlassian<AttachmentMetadata>(
			credentials,
			metadataPath,
		);

		const metadata = metadataResponse.data;
		methodLogger.debug('Retrieved attachment metadata', {
			filename: metadata.filename,
			size: metadata.size,
			mimeType: metadata.mimeType,
		});

		if (!metadata.content) {
			throw createApiError(
				'Attachment metadata does not contain content URL',
				500,
				metadata,
			);
		}

		// Step 2: Download the binary content
		const binaryContent = await fetchAtlassianBinary(
			credentials,
			metadata.content,
		);

		// Step 3: Determine output path
		let finalPath: string;
		if (outputPath) {
			finalPath = outputPath;
		} else {
			// Use temp directory with original filename
			const tempDir = os.tmpdir();
			finalPath = path.join(tempDir, metadata.filename);
		}

		// Step 4: Write the file
		await fs.writeFile(finalPath, binaryContent);

		methodLogger.debug(`Successfully downloaded attachment to ${finalPath}`, {
			size: binaryContent.length,
		});

		return {
			filePath: finalPath,
			filename: metadata.filename,
			mimeType: metadata.mimeType,
			size: binaryContent.length,
		};
	} catch (error) {
		methodLogger.error(
			`Failed to download attachment ${attachmentId}`,
			error,
		);

		if (error instanceof McpError) {
			throw error;
		}

		throw error;
	}
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
	attachFile,
	downloadAttachment,
};
