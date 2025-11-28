import { z } from 'zod';

/**
 * Base schema fields shared by all API tool arguments
 * Contains path, queryParams, and jq filter
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
	 */
	jq: z
		.string()
		.optional()
		.describe(
			'JMESPath expression to filter/transform the JSON response. Examples: "issues[*].key" (extract keys), "total" (single field), "{key: key, summary: fields.summary}" (reshape object). See https://jmespath.org for syntax.',
		),
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
