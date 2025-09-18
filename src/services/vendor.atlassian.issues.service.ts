import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	getAtlassianCredentials,
} from '../utils/transport.util.js';
import {
	Issue,
	IssuesResponse,
	SearchIssuesParams,
	GetIssueByIdParams,
	IssueSchema,
	IssuesResponseSchema,
	PageOfComments,
	PageOfCommentsSchema,
	IssueCommentSchema,
	ListCommentsParams,
	AddCommentParams,
	IssueWorklog,
	IssueWorklogContainer,
	IssueWorklogContainerSchema,
	IssueWorklogSchema,
	CreateMetaResponse,
	CreateMetaResponseSchema,
	GetCreateMetaParams,
	CreateIssueParams,
	CreateIssueResponse,
	CreateIssueResponseSchema,
	UpdateIssueParams,
	UpdateIssueResponse,
	UpdateIssueResponseSchema,
} from './vendor.atlassian.issues.types.js';
import {
	createAuthMissingError,
	createApiError,
	McpError,
} from '../utils/error.util.js';
import { validateResponse } from '../utils/validation.util.js';
import { z } from 'zod';

// Worklog types for API interactions
interface WorklogCreateData {
	timeSpentSeconds?: number;
	timeSpent?: string;
	started?: string;
	comment?: string | { type: string; version: number; content: unknown[] };
	visibility?: {
		type: string;
		identifier?: string;
		value?: string;
	};
	adjustEstimate?: string;
	newEstimate?: string;
	reduceBy?: string;
}

interface WorklogUpdateData {
	timeSpentSeconds?: number;
	timeSpent?: string;
	started?: string;
	comment?: string | { type: string; version: number; content: unknown[] };
	visibility?: {
		type: string;
		identifier?: string;
		value?: string;
	};
}

interface WorklogDeleteParams {
	adjustEstimate?: string;
	newEstimate?: string;
	increaseBy?: string;
}

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	'services/vendor.atlassian.issues.service.ts',
);

// Log service initialization
serviceLogger.debug('Jira issues service initialized');

/**
 * Base API path for Jira REST API v3
 * @see https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
 * @constant {string}
 */
const API_PATH = '/rest/api/3';

/**
 * @namespace VendorAtlassianIssuesService
 * @description Service for interacting with Jira Issues API.
 * Provides methods for searching issues and retrieving issue details.
 * All methods require valid Atlassian credentials configured in the environment.
 */

/**
 * Search for Jira issues using JQL and other criteria
 *
 * Retrieves a list of issues from Jira based on JQL query and other
 * search parameters. Uses the new enhanced JQL search API endpoint.
 * Supports pagination with nextPageToken, field selection, and expansion.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {SearchIssuesParams} [params={}] - Optional parameters for customizing the search
 * @param {string} [params.jql] - JQL query string for filtering issues
 * @param {number} [params.startAt] - Pagination start index (converted to nextPageToken internally)
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string[]} [params.fields] - Issue fields to include in response
 * @param {string[]} [params.expand] - Issue data to expand in response
 * @param {boolean} [params.validateQuery] - Whether to validate the JQL query
 * @param {string[]} [params.properties] - Issue properties to include in response
 * @param {boolean} [params.fieldsByKeys] - Whether to use field keys instead of IDs
 * @param {string} [params.nextPageToken] - Token for retrieving next page of results
 * @param {boolean} [params.reconcileIssues] - Whether to reconcile issue data
 * @returns {Promise<IssuesResponse>} Promise containing the issues search response with results and pagination info
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Search for issues with pagination
 * const response = await search({
 *   jql: "project = ABC AND status = 'In Progress'",
 *   maxResults: 10
 * });
 */
async function search(
	params: SearchIssuesParams = {},
): Promise<IssuesResponse> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'search',
	);
	methodLogger.debug('Searching Jira issues with params:', params);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			'Atlassian credentials required to search issues',
		);
	}

	// Use the new enhanced JQL search API endpoint
	const path = `${API_PATH}/search/jql`;

	// Build request body for POST request to new endpoint
	const requestBody: Record<string, unknown> = {};

	// JQL is required for the new endpoint
	if (params.jql) {
		requestBody.jql = params.jql;
	}

	// Pagination - prefer nextPageToken over startAt
	if (params.nextPageToken) {
		requestBody.nextPageToken = params.nextPageToken;
	}
	if (params.maxResults !== undefined) {
		requestBody.maxResults = params.maxResults;
	}

	// Field selection and expansion
	// If no fields are specified, request the standard fields for backward compatibility
	if (params.fields?.length) {
		requestBody.fields = params.fields;
	} else {
		// Default fields to maintain backward compatibility with old API
		requestBody.fields = ['*all'];
	}

	if (params.expand?.length) {
		requestBody.expand = params.expand.join(',');
	}
	if (params.properties?.length) {
		requestBody.properties = params.properties;
	}
	if (params.fieldsByKeys !== undefined) {
		requestBody.fieldsByKeys = params.fieldsByKeys;
	}
	if (params.reconcileIssues !== undefined) {
		requestBody.reconcileIssues = params.reconcileIssues;
	}

	methodLogger.debug(`Calling new Jira JQL API: ${path}`);
	methodLogger.debug('Request body:', requestBody);

	try {
		const rawData = await fetchAtlassian(credentials, path, {
			method: 'POST',
			body: requestBody,
		});
		return validateResponse(rawData, IssuesResponseSchema, 'issues search');
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian or validation
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error('Unexpected error searching issues:', error);
		throw createApiError(
			`Unexpected error searching Jira issues: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Get detailed information about a specific Jira issue
 *
 * Retrieves comprehensive details about a single issue, including metadata,
 * description, comments, and more.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} idOrKey - The ID or key of the issue to retrieve
 * @param {GetIssueByIdParams} [params={}] - Optional parameters for customizing the response
 * @param {string[]} [params.fields] - Issue fields to include in response
 * @param {string[]} [params.expand] - Issue data to expand in response
 * @param {string[]} [params.properties] - Issue properties to include in response
 * @param {boolean} [params.fieldsByKeys] - Whether to use field keys instead of IDs
 * @param {boolean} [params.updateHistory] - Whether to update issue view history
 * @returns {Promise<Issue>} Promise containing the detailed issue information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get issue details with expanded changelog
 * const issue = await get('ABC-123', {
 *   expand: ['changelog']
 * });
 */
async function get(
	idOrKey: string,
	params: GetIssueByIdParams = {},
): Promise<Issue> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'get',
	);
	methodLogger.debug(
		`Getting Jira issue with ID/key: ${idOrKey}, params:`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			`Atlassian credentials required to get issue ${idOrKey}`,
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Field selection and expansion
	if (params.fields?.length) {
		queryParams.set('fields', params.fields.join(','));
	}
	if (params.expand?.length) {
		queryParams.set('expand', params.expand.join(','));
	}
	if (params.properties?.length) {
		queryParams.set('properties', params.properties.join(','));
	}
	if (params.fieldsByKeys !== undefined) {
		queryParams.set('fieldsByKeys', params.fieldsByKeys.toString());
	}
	if (params.updateHistory !== undefined) {
		queryParams.set('updateHistory', params.updateHistory.toString());
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/issue/${idOrKey}${queryString}`;

	methodLogger.debug(`Calling Jira API: ${path}`);

	try {
		const rawData = await fetchAtlassian(credentials, path);
		return validateResponse(
			rawData,
			IssueSchema,
			`issue detail ${idOrKey}`,
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian or validation
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(`Unexpected error getting issue ${idOrKey}:`, error);
		throw createApiError(
			`Unexpected error retrieving Jira issue ${idOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Get comments for a specific Jira issue
 *
 * Retrieves the list of comments for an issue with pagination support.
 * Can be sorted and expanded as needed.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to get comments for
 * @param {ListCommentsParams} [params={}] - Optional parameters for customizing the response
 * @param {number} [params.startAt] - Pagination start index
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string} [params.orderBy] - Field and direction to order results by
 * @param {string[]} [params.expand] - Comment data to expand in response (e.g., 'renderedBody')
 * @returns {Promise<PageOfComments>} Promise containing the comments with pagination information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get comments for an issue with pagination
 * const comments = await getComments('ABC-123', {
 *   maxResults: 10,
 *   expand: ['renderedBody']
 * });
 */
async function getComments(
	issueIdOrKey: string,
	params: ListCommentsParams = {},
): Promise<PageOfComments> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'getComments',
	);
	methodLogger.debug(
		`Getting comments for issue ${issueIdOrKey} with params:`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			`Atlassian credentials required to get comments for issue ${issueIdOrKey}`,
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Pagination
	if (params.startAt !== undefined) {
		queryParams.set('startAt', params.startAt.toString());
	}
	if (params.maxResults !== undefined) {
		queryParams.set('maxResults', params.maxResults.toString());
	}

	// Sorting
	if (params.orderBy) {
		queryParams.set('orderBy', params.orderBy);
	}

	// Expansion
	if (params.expand?.length) {
		queryParams.set('expand', params.expand.join(','));
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/issue/${issueIdOrKey}/comment${queryString}`;

	methodLogger.debug(`Calling Jira API: ${path}`);

	try {
		const rawData = await fetchAtlassian(credentials, path);
		return validateResponse(
			rawData,
			PageOfCommentsSchema,
			`issue comments ${issueIdOrKey}`,
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian or validation
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error getting comments for issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error retrieving comments for Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Add a comment to a specific Jira issue
 *
 * Creates a new comment on the specified issue with the provided content.
 * The comment body must be provided in Atlassian Document Format (ADF).
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to add a comment to
 * @param {AddCommentParams} commentData - Parameters for the comment to add
 * @returns {Promise<z.infer<typeof IssueCommentSchema>>} Promise containing the created comment information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Add a comment with ADF content
 * const comment = await addComment('ABC-123', {
 *   body: {
 *     version: 1,
 *     type: "doc",
 *     content: [
 *       {
 *         type: "paragraph",
 *         content: [
 *           {
 *             type: "text",
 *             text: "This is a test comment"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * });
 */
async function addComment(
	issueIdOrKey: string,
	commentData: AddCommentParams,
): Promise<z.infer<typeof IssueCommentSchema>> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'addComment',
	);

	try {
		methodLogger.debug('Adding comment to issue', issueIdOrKey, {
			bodyProvided: !!commentData.body,
		});

		// Get configured credentials
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			throw createAuthMissingError(
				`Atlassian credentials required to add comment to issue ${issueIdOrKey}`,
			);
		}

		// Build API endpoint
		const apiEndpoint = `${API_PATH}/issue/${issueIdOrKey}/comment`;

		// Add expand parameter for rendered content
		const queryParams = new URLSearchParams();
		if (commentData.expand?.length) {
			queryParams.append('expand', commentData.expand.join(','));
		}

		// Prepare request URL and options
		const url = `${apiEndpoint}${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		// Prepare request body - using the structure that works with Jira API
		// The body should be an object containing the ADF document
		const requestBody = {
			body: commentData.body,
			// Optional fields that may be added later
			...(commentData.visibility
				? { visibility: commentData.visibility }
				: {}),
		};

		methodLogger.debug('Calling Jira API:', url);

		// Make the API call - note the correct parameter order
		const response = await fetchAtlassian(credentials, url, {
			method: 'POST',
			body: requestBody,
		});

		return validateResponse(
			response,
			IssueCommentSchema,
			`comment creation on issue ${issueIdOrKey}`,
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian or validation
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error adding comment to issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error adding comment to Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Get worklogs for a specific Jira issue
 *
 * Retrieves the list of worklogs for an issue with pagination support.
 * Time tracking must be enabled in Jira for this operation to work.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to get worklogs for
 * @param {ListWorklogsParams} [params={}] - Optional parameters for customizing the response
 * @param {number} [params.startAt] - Pagination start index
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string[]} [params.expand] - Worklog data to expand in response
 * @returns {Promise<IssueWorklogContainer>} Promise containing the worklogs with pagination information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get worklogs for an issue with pagination
 * const worklogs = await getWorklogs('ABC-123', {
 *   maxResults: 10,
 *   expand: ['properties']
 * });
 */
async function getWorklogs(
	issueIdOrKey: string,
	params: {
		startAt?: number;
		maxResults?: number;
		expand?: string[];
	} = {},
): Promise<IssueWorklogContainer> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'getWorklogs',
	);
	methodLogger.debug(
		`Getting worklogs for issue ${issueIdOrKey} with params:`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			`Atlassian credentials required to get worklogs for issue ${issueIdOrKey}`,
		);
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	// Pagination
	if (params.startAt !== undefined) {
		queryParams.set('startAt', params.startAt.toString());
	}
	if (params.maxResults !== undefined) {
		queryParams.set('maxResults', params.maxResults.toString());
	}

	// Expansion
	if (params.expand?.length) {
		queryParams.set('expand', params.expand.join(','));
	}

	const queryString = queryParams.toString()
		? `?${queryParams.toString()}`
		: '';
	const path = `${API_PATH}/issue/${issueIdOrKey}/worklog${queryString}`;

	methodLogger.debug(`Calling Jira API: ${path}`);

	try {
		const rawData = await fetchAtlassian(credentials, path);
		// Validate response against schema
		return validateResponse(
			rawData,
			IssueWorklogContainerSchema,
			'getWorklogs',
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error getting worklogs for issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error retrieving worklogs for Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Add a worklog to a specific Jira issue
 *
 * Creates a new worklog on the specified issue with time spent and optional comment.
 * Time tracking must be enabled in Jira for this operation to work.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to add a worklog to
 * @param {WorklogCreateData} worklogData - Parameters for the worklog to add
 * @returns {Promise<IssueWorklog>} Promise containing the created worklog information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Add a worklog with time spent and comment
 * const worklog = await addWorklog('ABC-123', {
 *   timeSpentSeconds: 7200,
 *   comment: { ... }, // ADF format
 *   started: "2024-01-22T10:00:00.000+0000"
 * });
 */
async function addWorklog(
	issueIdOrKey: string,
	worklogData: WorklogCreateData,
): Promise<IssueWorklog> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'addWorklog',
	);

	try {
		methodLogger.debug('Adding worklog to issue', issueIdOrKey, {
			timeSpentSeconds: worklogData.timeSpentSeconds,
			hasComment: !!worklogData.comment,
		});

		// Get configured credentials
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			throw createAuthMissingError(
				`Atlassian credentials required to add worklog to issue ${issueIdOrKey}`,
			);
		}

		// Build API endpoint
		const apiEndpoint = `${API_PATH}/issue/${issueIdOrKey}/worklog`;

		// Handle query parameters for estimate adjustment
		const queryParams = new URLSearchParams();
		if (worklogData.adjustEstimate) {
			queryParams.set('adjustEstimate', worklogData.adjustEstimate);
			if (worklogData.newEstimate) {
				queryParams.set('newEstimate', worklogData.newEstimate);
			}
			if (worklogData.reduceBy) {
				queryParams.set('reduceBy', worklogData.reduceBy);
			}
		}

		// Prepare request URL
		const url = `${apiEndpoint}${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		// Prepare request body - remove query params from body
		const requestBody = {
			timeSpentSeconds: worklogData.timeSpentSeconds,
			...(worklogData.comment ? { comment: worklogData.comment } : {}),
			...(worklogData.started ? { started: worklogData.started } : {}),
			...(worklogData.visibility
				? { visibility: worklogData.visibility }
				: {}),
		};

		methodLogger.debug('Calling Jira API:', url);

		// Make the API call
		const response = await fetchAtlassian(credentials, url, {
			method: 'POST',
			body: requestBody,
		});

		// Validate response against schema
		return validateResponse(response, IssueWorklogSchema, 'addWorklog');
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error adding worklog to issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error adding worklog to Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Update an existing worklog
 *
 * Updates a worklog on the specified issue with new time spent, comment, or start time.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue
 * @param {string} worklogId - The ID of the worklog to update
 * @param {WorklogUpdateData} updateData - Parameters for the worklog update
 * @returns {Promise<IssueWorklog>} Promise containing the updated worklog information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 */
async function updateWorklog(
	issueIdOrKey: string,
	worklogId: string,
	updateData: WorklogUpdateData,
): Promise<IssueWorklog> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'updateWorklog',
	);

	try {
		methodLogger.debug(
			`Updating worklog ${worklogId} on issue ${issueIdOrKey}`,
		);

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			throw createAuthMissingError(
				`Atlassian credentials required to update worklog ${worklogId} on issue ${issueIdOrKey}`,
			);
		}

		const url = `${API_PATH}/issue/${issueIdOrKey}/worklog/${worklogId}`;

		methodLogger.debug('Calling Jira API:', url);

		const response = await fetchAtlassian(credentials, url, {
			method: 'PUT',
			body: updateData,
		});

		// Validate response against schema
		return validateResponse(response, IssueWorklogSchema, 'updateWorklog');
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		methodLogger.error(
			`Unexpected error updating worklog ${worklogId} on issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error updating worklog ${worklogId} on Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Delete a worklog from a Jira issue
 *
 * Removes a worklog from the specified issue with optional estimate adjustment.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue
 * @param {string} worklogId - The ID of the worklog to delete
 * @param {WorklogDeleteParams} [params={}] - Optional parameters for estimate adjustment
 * @returns {Promise<void>} Promise that resolves when the worklog is deleted
 * @throws {Error} If Atlassian credentials are missing or API request fails
 */
async function deleteWorklog(
	issueIdOrKey: string,
	worklogId: string,
	params: WorklogDeleteParams = {},
): Promise<void> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'deleteWorklog',
	);

	try {
		methodLogger.debug(
			`Deleting worklog ${worklogId} from issue ${issueIdOrKey}`,
		);

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			throw createAuthMissingError(
				`Atlassian credentials required to delete worklog ${worklogId} from issue ${issueIdOrKey}`,
			);
		}

		// Build query parameters for estimate adjustment
		const queryParams = new URLSearchParams();
		if (params.adjustEstimate) {
			queryParams.set('adjustEstimate', params.adjustEstimate);
			if (params.newEstimate) {
				queryParams.set('newEstimate', params.newEstimate);
			}
			if (params.increaseBy) {
				queryParams.set('increaseBy', params.increaseBy);
			}
		}

		const url = `${API_PATH}/issue/${issueIdOrKey}/worklog/${worklogId}${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;

		methodLogger.debug('Calling Jira API:', url);

		await fetchAtlassian(credentials, url, {
			method: 'DELETE',
		});
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		methodLogger.error(
			`Unexpected error deleting worklog ${worklogId} from issue ${issueIdOrKey}:`,
			error,
		);
		throw createApiError(
			`Unexpected error deleting worklog ${worklogId} from Jira issue ${issueIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Get create metadata for project issue types
 *
 * @param projectIdOrKey - Project ID or key
 * @param issueTypeId - Optional specific issue type ID
 * @param params - Optional parameters for filtering
 * @returns Promise containing create metadata
 */
async function getCreateMeta(
	projectIdOrKey: string,
	issueTypeId?: string,
	params: GetCreateMetaParams = {},
): Promise<CreateMetaResponse> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'getCreateMeta',
	);
	methodLogger.debug(
		`Getting create metadata for project ${projectIdOrKey}${issueTypeId ? `, issue type ${issueTypeId}` : ''}`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			`Atlassian credentials required to get create metadata for project ${projectIdOrKey}`,
		);
	}

	try {
		// Use the new endpoint for specific issue type if provided
		let path: string;
		if (issueTypeId) {
			path = `${API_PATH}/issue/createmeta/${projectIdOrKey}/issuetypes/${issueTypeId}`;
		} else {
			// Use the legacy endpoint for all issue types in the project
			const queryParams = new URLSearchParams();
			queryParams.set('projectKeys', projectIdOrKey);
			queryParams.set('expand', 'projects.issuetypes.fields');

			if (params.issuetypeIds?.length) {
				queryParams.set('issuetypeIds', params.issuetypeIds.join(','));
			}
			if (params.issuetypeNames?.length) {
				queryParams.set(
					'issuetypeNames',
					params.issuetypeNames.join(','),
				);
			}

			path = `${API_PATH}/issue/createmeta?${queryParams.toString()}`;
		}

		methodLogger.debug(`Calling Jira API: ${path}`);

		const rawData = await fetchAtlassian(credentials, path);
		return validateResponse(
			rawData,
			CreateMetaResponseSchema,
			'create metadata',
		);
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		methodLogger.error('Unexpected error getting create metadata:', error);
		throw createApiError(
			`Unexpected error getting create metadata for project ${projectIdOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Create a new Jira issue
 *
 * @param params - Issue creation parameters with fields data
 * @returns Promise containing the created issue response
 */
async function createIssue(
	params: CreateIssueParams,
): Promise<CreateIssueResponse> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'createIssue',
	);
	methodLogger.debug('Creating new issue with params:', params);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			'Atlassian credentials required to create issue',
		);
	}

	try {
		// Build query parameters
		const queryParams = new URLSearchParams();
		if (params.updateHistory !== undefined) {
			queryParams.set('updateHistory', params.updateHistory.toString());
		}

		const queryString = queryParams.toString()
			? `?${queryParams.toString()}`
			: '';
		const path = `${API_PATH}/issue${queryString}`;

		methodLogger.debug(`Calling Jira API: ${path}`);

		const requestBody = {
			fields: params.fields,
			...(params.update && { update: params.update }),
			...(params.historyMetadata && {
				historyMetadata: params.historyMetadata,
			}),
			...(params.properties && { properties: params.properties }),
		};

		const rawData = await fetchAtlassian(credentials, path, {
			method: 'POST',
			body: requestBody,
		});

		return validateResponse(
			rawData,
			CreateIssueResponseSchema,
			'create issue',
		);
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		methodLogger.error('Unexpected error creating issue:', error);
		throw createApiError(
			`Unexpected error creating Jira issue: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

/**
 * Update an existing Jira issue
 *
 * Updates the fields of an existing issue. Supports both standard and custom fields.
 * Can optionally return the updated issue data.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} idOrKey - The ID or key of the issue to update
 * @param {UpdateIssueParams} params - Update parameters with fields data
 * @param {Record<string, unknown>} [params.fields] - Issue fields to update
 * @param {Record<string, unknown[]>} [params.update] - Update operations to perform
 * @param {boolean} [params.notifyUsers] - Whether to send notifications to users
 * @param {boolean} [params.overrideScreenSecurity] - Whether to override screen security
 * @param {boolean} [params.overrideEditableFlag] - Whether to override editable flag
 * @param {boolean} [params.returnIssue] - Whether to return the updated issue
 * @param {string[]} [params.expand] - Issue data to expand in response
 * @returns {Promise<UpdateIssueResponse>} Promise containing the update response
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Update issue summary and description
 * const response = await updateIssue('ABC-123', {
 *   fields: {
 *     summary: 'Updated summary',
 *     description: 'Updated description'
 *   }
 * });
 * 
 * // Update custom field
 * const response = await updateIssue('ABC-123', {
 *   fields: {
 *     'customfield_10001': 'Custom value'
 *   }
 * });
 */
async function updateIssue(
	idOrKey: string,
	params: UpdateIssueParams,
): Promise<UpdateIssueResponse> {
	const methodLogger = Logger.forContext(
		'services/vendor.atlassian.issues.service.ts',
		'updateIssue',
	);
	methodLogger.debug(
		`Updating issue ${idOrKey} with params:`,
		params,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError(
			`Atlassian credentials required to update issue ${idOrKey}`,
		);
	}

	try {
		// Build query parameters
		const queryParams = new URLSearchParams();
		if (params.notifyUsers !== undefined) {
			queryParams.set('notifyUsers', params.notifyUsers.toString());
		}
		if (params.overrideScreenSecurity !== undefined) {
			queryParams.set('overrideScreenSecurity', params.overrideScreenSecurity.toString());
		}
		if (params.overrideEditableFlag !== undefined) {
			queryParams.set('overrideEditableFlag', params.overrideEditableFlag.toString());
		}
		if (params.returnIssue !== undefined) {
			queryParams.set('returnIssue', params.returnIssue.toString());
		}
		if (params.expand?.length) {
			queryParams.set('expand', params.expand.join(','));
		}

		const queryString = queryParams.toString()
			? `?${queryParams.toString()}`
			: '';
		const path = `${API_PATH}/issue/${idOrKey}${queryString}`;

		methodLogger.debug(`Calling Jira API: ${path}`);

		const requestBody: Record<string, unknown> = {};
		
		if (params.fields) {
			requestBody.fields = params.fields;
		}
		if (params.update) {
			requestBody.update = params.update;
		}
		if (params.historyMetadata) {
			requestBody.historyMetadata = params.historyMetadata;
		}
		if (params.properties) {
			requestBody.properties = params.properties;
		}

		const rawData = await fetchAtlassian(credentials, path, {
			method: 'PUT',
			body: requestBody,
		});

		// If returnIssue is false or not set, Jira returns 204 No Content
		// In that case, return a minimal response with just the issue key/id
		if (!rawData) {
			return {
				key: idOrKey,
			};
		}

		return validateResponse(
			rawData,
			UpdateIssueResponseSchema,
			`update issue ${idOrKey}`,
		);
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		methodLogger.error(`Unexpected error updating issue ${idOrKey}:`, error);
		throw createApiError(
			`Unexpected error updating Jira issue ${idOrKey}: ${error instanceof Error ? error.message : String(error)}`,
			500,
			error,
		);
	}
}

export default {
	search,
	get,
	getComments,
	addComment,
	getWorklogs,
	addWorklog,
	updateWorklog,
	deleteWorklog,
	getCreateMeta,
	createIssue,
	updateIssue,
};
