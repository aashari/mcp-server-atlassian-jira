import { z } from 'zod';

/**
 * Output format options for API responses
 * - toon: Token-Oriented Object Notation (default, more token-efficient for LLMs)
 * - json: Standard JSON format
 */
export const OutputFormat = z
	.enum(['toon', 'json'])
	.optional()
	.describe(
		'Output format: "toon" (default, 30-60% fewer tokens) or "json". TOON is optimized for LLMs with tabular arrays and minimal syntax.',
	);

/**
 * Base schema fields shared by all API tool arguments
 * Contains path, queryParams, jq filter, and outputFormat
 */
const BaseApiToolArgs = {
	/**
	 * The API endpoint path (without base URL)
	 * Examples:
	 * - "/rest/api/3/project" - list projects
	 * - "/rest/api/3/project/{projectIdOrKey}" - get project
	 * - "/rest/api/3/search" - search issues with JQL
	 * - "/rest/api/3/issue/{issueIdOrKey}" - get issue
	 * - "/rest/api/3/issue" - create issue
	 */
	path: z
		.string()
		.min(1, 'Path is required')
		.describe(
			'The Jira API endpoint path (without base URL). Must start with "/". Examples: "/rest/api/3/project", "/rest/api/3/search", "/rest/api/3/issue/{issueIdOrKey}"',
		),

	/**
	 * Optional query parameters as key-value pairs
	 */
	queryParams: z
		.record(z.string())
		.optional()
		.describe(
			'Optional query parameters as key-value pairs. Examples: {"maxResults": "50", "startAt": "0", "jql": "project=PROJ", "fields": "summary,status"}',
		),

	/**
	 * Optional JMESPath expression to filter/transform the response
	 * IMPORTANT: Always use this to reduce response size and token costs
	 */
	jq: z
		.string()
		.optional()
		.describe(
			'JMESPath expression to filter/transform the response. IMPORTANT: Always use this to extract only needed fields and reduce token costs. Examples: "issues[*].{key: key, summary: fields.summary}" (extract specific fields), "issues[0]" (first result), "issues[*].key" (keys only). See https://jmespath.org',
		),

	/**
	 * Output format for the response
	 * Defaults to TOON (token-efficient), can be set to JSON if needed
	 */
	outputFormat: OutputFormat,
};

/**
 * Body field for requests that include a request body (POST, PUT, PATCH)
 */
const bodyField = z
	.record(z.unknown())
	.describe(
		'Request body as a JSON object. Structure depends on the endpoint. Example for issue: {"fields": {"project": {"key": "PROJ"}, "summary": "Issue title", "issuetype": {"name": "Task"}}}',
	);

/**
 * Schema for jira_get tool arguments (GET requests - no body)
 */
export const GetApiToolArgs = z.object(BaseApiToolArgs);
export type GetApiToolArgsType = z.infer<typeof GetApiToolArgs>;

/**
 * Schema for requests with body (POST, PUT, PATCH)
 */
export const RequestWithBodyArgs = z.object({
	...BaseApiToolArgs,
	body: bodyField,
});
export type RequestWithBodyArgsType = z.infer<typeof RequestWithBodyArgs>;

/**
 * Schema for jira_post tool arguments (POST requests)
 */
export const PostApiToolArgs = RequestWithBodyArgs;
export type PostApiToolArgsType = RequestWithBodyArgsType;

/**
 * Schema for jira_put tool arguments (PUT requests)
 */
export const PutApiToolArgs = RequestWithBodyArgs;
export type PutApiToolArgsType = RequestWithBodyArgsType;

/**
 * Schema for jira_patch tool arguments (PATCH requests)
 */
export const PatchApiToolArgs = RequestWithBodyArgs;
export type PatchApiToolArgsType = RequestWithBodyArgsType;

/**
 * Schema for jira_delete tool arguments (DELETE requests - no body)
 */
export const DeleteApiToolArgs = GetApiToolArgs;
export type DeleteApiToolArgsType = GetApiToolArgsType;
