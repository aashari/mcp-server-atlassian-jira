import atlassianApiService from '../services/vendor.atlassian.api.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { ControllerResponse } from '../types/common.types.js';
import {
	GetApiToolArgsType,
	RequestWithBodyArgsType,
	AttachToolArgsType,
	GetAttachmentToolArgsType,
} from '../tools/atlassian.api.types.js';
import { applyJqFilter, toOutputString } from '../utils/jq.util.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * @namespace AtlassianApiController
 * @description Controller for handling generic Jira API requests.
 *              Orchestrates calls to the Atlassian API service and handles
 *              response formatting (JQ filtering, TOON/JSON output).
 *
 * Architecture:
 * - Tool → Controller (this file) → Service → Transport
 * - Controller handles: JQ filtering, output formatting, error context
 * - Service handles: Credentials, path normalization, API calls
 */

// Logger instance for this module
const logger = Logger.forContext('controllers/atlassian.api.controller.ts');

/**
 * Output format type
 */
type OutputFormat = 'toon' | 'json';

/**
 * Base options for all API requests
 */
interface BaseRequestOptions {
	path: string;
	queryParams?: Record<string, string>;
	jq?: string;
	outputFormat?: OutputFormat;
}

/**
 * Options for requests that include a body (POST, PUT, PATCH)
 */
interface RequestWithBodyOptions extends BaseRequestOptions {
	body?: Record<string, unknown>;
}

/**
 * Shared handler for all HTTP methods
 *
 * @param method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param options - Request options including path, queryParams, body (for non-GET), and jq filter
 * @returns Promise with formatted response content
 */
async function handleRequest(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	options: RequestWithBodyOptions,
): Promise<ControllerResponse> {
	const methodLogger = logger.forMethod(`handle${method}`);

	try {
		methodLogger.debug(`Making ${method} request`, {
			path: options.path,
			...(options.body && { bodyKeys: Object.keys(options.body) }),
		});

		// Call the service layer (returns TransportResponse with data and rawResponsePath)
		const response = await atlassianApiService.request<unknown>(
			options.path,
			{
				method,
				queryParams: options.queryParams,
				body: options.body,
			},
		);

		methodLogger.debug('Successfully received response from service');

		// Apply JQ filter if provided, otherwise return raw data
		const result = applyJqFilter(response.data, options.jq);

		// Convert to output format (TOON by default, JSON if requested)
		const useToon = options.outputFormat !== 'json';
		const content = await toOutputString(result, useToon);

		return {
			content,
			rawResponsePath: response.rawResponsePath,
		};
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'API',
			operation: `${method} request`,
			source: `controllers/atlassian.api.controller.ts@handle${method}`,
			additionalInfo: { path: options.path },
		});
	}
}

/**
 * Generic GET request to Jira API
 *
 * @param options - Options containing path, queryParams, and optional jq filter
 * @returns Promise with raw JSON response (optionally filtered)
 */
export async function handleGet(
	options: GetApiToolArgsType,
): Promise<ControllerResponse> {
	return handleRequest('GET', options);
}

/**
 * Generic POST request to Jira API
 *
 * @param options - Options containing path, body, queryParams, and optional jq filter
 * @returns Promise with raw JSON response (optionally filtered)
 */
export async function handlePost(
	options: RequestWithBodyArgsType,
): Promise<ControllerResponse> {
	return handleRequest('POST', options);
}

/**
 * Generic PUT request to Jira API
 *
 * @param options - Options containing path, body, queryParams, and optional jq filter
 * @returns Promise with raw JSON response (optionally filtered)
 */
export async function handlePut(
	options: RequestWithBodyArgsType,
): Promise<ControllerResponse> {
	return handleRequest('PUT', options);
}

/**
 * Generic PATCH request to Jira API
 *
 * @param options - Options containing path, body, queryParams, and optional jq filter
 * @returns Promise with raw JSON response (optionally filtered)
 */
export async function handlePatch(
	options: RequestWithBodyArgsType,
): Promise<ControllerResponse> {
	return handleRequest('PATCH', options);
}

/**
 * Generic DELETE request to Jira API
 *
 * @param options - Options containing path, queryParams, and optional jq filter
 * @returns Promise with raw JSON response (optionally filtered)
 */
export async function handleDelete(
	options: GetApiToolArgsType,
): Promise<ControllerResponse> {
	return handleRequest('DELETE', options);
}

/**
 * Attach a file to a Jira issue
 *
 * @param options - Options containing issueIdOrKey and either filePath or textContent/fileName
 * @returns Promise with attachment metadata
 */
export async function handleAttach(
	options: AttachToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = logger.forMethod('handleAttach');

	try {
		let fileBuffer: Buffer;
		let fileName: string;

		if (options.filePath) {
			// Read file from disk
			methodLogger.debug(`Reading file from path: ${options.filePath}`);
			fileBuffer = await fs.readFile(options.filePath);
			fileName = path.basename(options.filePath);
		} else if (options.textContent && options.fileName) {
			// Create buffer from text content
			methodLogger.debug(`Creating file from text content: ${options.fileName}`);
			fileBuffer = Buffer.from(options.textContent, 'utf-8');
			fileName = options.fileName;
		} else {
			throw new Error(
				'Invalid arguments: must provide either filePath or textContent with fileName',
			);
		}

		methodLogger.debug(`Attaching file to issue ${options.issueIdOrKey}`, {
			fileName,
			fileSize: fileBuffer.length,
		});

		const response = await atlassianApiService.attachFile(
			options.issueIdOrKey,
			fileBuffer,
			fileName,
		);

		methodLogger.debug('Successfully attached file');

		// Format the response
		const result = response.data;
		const content = await toOutputString(result, true);

		return {
			content,
			rawResponsePath: response.rawResponsePath,
		};
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'Attachment',
			operation: 'attach file',
			source: 'controllers/atlassian.api.controller.ts@handleAttach',
			additionalInfo: { issueIdOrKey: options.issueIdOrKey },
		});
	}
}

/**
 * Download an attachment from Jira to a local file
 *
 * @param options - Options containing attachmentId and optional outputPath
 * @returns Promise with download result (file path)
 */
export async function handleGetAttachment(
	options: GetAttachmentToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = logger.forMethod('handleGetAttachment');

	try {
		methodLogger.debug(`Downloading attachment ${options.attachmentId}`, {
			outputPath: options.outputPath,
		});

		const result = await atlassianApiService.downloadAttachment(
			options.attachmentId,
			options.outputPath,
		);

		methodLogger.debug('Successfully downloaded attachment', {
			filePath: result.filePath,
			size: result.size,
		});

		// Format the response as a simple success message with file info
		const content = await toOutputString(
			{
				success: true,
				filePath: result.filePath,
				filename: result.filename,
				mimeType: result.mimeType,
				size: result.size,
			},
			true,
		);

		return {
			content,
			rawResponsePath: null,
		};
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'Attachment',
			operation: 'download attachment',
			source: 'controllers/atlassian.api.controller.ts@handleGetAttachment',
			additionalInfo: { attachmentId: options.attachmentId },
		});
	}
}
