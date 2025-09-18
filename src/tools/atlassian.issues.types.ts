import { z } from 'zod';

/**
 * Base pagination arguments for all tools
 */
const PaginationArgs = {
	limit: z
		.number()
		.min(1)
		.max(100)
		.optional()
		.describe(
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results.',
		),

	startAt: z
		.number()
		.int()
		.nonnegative()
		.optional()
		.describe(
			'Index of the first item to return (0-based offset). Use this for pagination instead of cursor, as Jira uses offset-based pagination.',
		),
};

/**
 * Arguments for listing Jira issues
 * Includes optional filters with defaults applied in the controller
 */
const ListIssuesToolArgs = z.object({
	/**
	 * Standardized JQL parameter for filtering
	 */
	jql: z
		.string()
		.optional()
		.describe(
			'Filter issues using JQL syntax. Use this for complex queries like "project = TEAM AND status = \'In Progress\'" or "assignee = currentUser()". If omitted, returns issues according to your Jira default search.',
		),

	/**
	 * Project key or ID to filter issues by
	 */
	projectKeyOrId: z
		.string()
		.optional()
		.describe(
			'Filter issues by a specific project key or ID (e.g., "PROJ" or "10001"). If `jql` is also provided, this will be ANDed with it (e.g., `project = YOUR_KEY AND (YOUR_JQL)`). Will be combined with other filters using AND logic.',
		),

	/**
	 * Status names to filter issues by
	 */
	statuses: z
		.array(z.string())
		.optional()
		.describe(
			'Filter issues by specific status names (e.g., ["To Do", "In Progress"]). Requires exact names; use jira_ls_statuses to discover. If `jql` is also provided, this will be ANDed with it (e.g., `status IN ("To Do", "In Progress") AND (YOUR_JQL)`). Will be combined with other filters using AND logic.',
		),

	/**
	 * Sorting order for issues
	 */
	orderBy: z
		.string()
		.optional()
		.describe(
			'Specify the sorting order using JQL ORDER BY clause syntax (e.g., "priority DESC", "created ASC"). If no `orderBy` is provided and a `jql` query without an ORDER BY clause is given, it defaults to `updated DESC`. If `jql` is empty, it also defaults to `ORDER BY updated DESC`.',
		),

	/**
	 * Maximum number of issues to return and pagination
	 */
	...PaginationArgs,
});

type ListIssuesToolArgsType = z.infer<typeof ListIssuesToolArgs>;

/**
 * Arguments for getting a specific Jira issue
 */
const GetIssueToolArgs = z.object({
	/**
	 * Standardized issue identifier parameter
	 */
	issueIdOrKey: z
		.string()
		.describe(
			'The ID or key of the Jira issue to retrieve (e.g., "10001" or "PROJ-123"). This is required and must be a valid issue ID or key from your Jira instance.',
		),
});

type GetIssueToolArgsType = z.infer<typeof GetIssueToolArgs>;

/**
 * Arguments for updating a Jira issue
 */
const UpdateIssueToolArgs = z.object({
	/**
	 * Issue identifier (ID or key)
	 */
	issueIdOrKey: z
		.string()
		.describe(
			'The ID or key of the Jira issue to update (e.g., "10001" or "PROJ-123"). This is required and must be a valid issue ID or key from your Jira instance.',
		),

	/**
	 * Fields to update
	 */
	fields: z
		.record(z.string(), z.unknown())
		.optional()
		.describe(
			'Object containing the fields to update. Keys are field names (e.g., "summary", "description") or custom field IDs (e.g., "customfield_10001"). Values depend on the field type. Text values for rich text fields (description, custom text fields) are automatically converted to Atlassian Document Format (ADF). Supports markdown formatting.',
		),

	/**
	 * Update operations
	 */
	update: z
		.record(z.string(), z.array(z.unknown()))
		.optional()
		.describe(
			'Object containing update operations for fields that support them (e.g., adding/removing labels, components). Each key is a field name and value is an array of operations.',
		),

	/**
	 * Whether to notify users
	 */
	notifyUsers: z
		.boolean()
		.optional()
		.describe(
			'Whether to send notifications to users about the update. Defaults to true.',
		),

	/**
	 * Whether to return the updated issue
	 */
	returnIssue: z
		.boolean()
		.optional()
		.describe(
			'Whether to return the updated issue data in the response. Defaults to false for better performance.',
		),

	/**
	 * Fields to expand in the response (only used if returnIssue is true)
	 */
	expand: z
		.array(z.string())
		.optional()
		.describe(
			'Fields to expand in the response when returnIssue is true (e.g., ["changelog", "renderedFields"]).',
		),
});

type UpdateIssueToolArgsType = z.infer<typeof UpdateIssueToolArgs>;

export {
	ListIssuesToolArgs,
	type ListIssuesToolArgsType,
	GetIssueToolArgs,
	type GetIssueToolArgsType,
	UpdateIssueToolArgs,
	type UpdateIssueToolArgsType,
};
