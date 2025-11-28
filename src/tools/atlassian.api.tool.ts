import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	GetApiToolArgs,
	type GetApiToolArgsType,
	RequestWithBodyArgs,
	type RequestWithBodyArgsType,
	DeleteApiToolArgs,
} from './atlassian.api.types.js';
import {
	handleGet,
	handlePost,
	handlePut,
	handlePatch,
	handleDelete,
} from '../controllers/atlassian.api.controller.js';

// Create a contextualized logger for this file
const toolLogger = Logger.forContext('tools/atlassian.api.tool.ts');

// Log tool initialization
toolLogger.debug('Jira API tool initialized');

/**
 * Creates an MCP tool handler for GET/DELETE requests (no body)
 *
 * @param methodName - Name of the HTTP method for logging
 * @param handler - Controller handler function
 * @returns MCP tool handler function
 */
function createReadHandler(
	methodName: string,
	handler: (options: GetApiToolArgsType) => Promise<{ content: string }>,
) {
	return async (args: Record<string, unknown>) => {
		const methodLogger = Logger.forContext(
			'tools/atlassian.api.tool.ts',
			methodName.toLowerCase(),
		);
		methodLogger.debug(`Making ${methodName} request with args:`, args);

		try {
			const result = await handler(args as GetApiToolArgsType);

			methodLogger.debug(
				'Successfully retrieved response from controller',
			);

			return {
				content: [
					{
						type: 'text' as const,
						text: result.content,
					},
				],
			};
		} catch (error) {
			methodLogger.error(`Failed to make ${methodName} request`, error);
			return formatErrorForMcpTool(error);
		}
	};
}

/**
 * Creates an MCP tool handler for POST/PUT/PATCH requests (with body)
 *
 * @param methodName - Name of the HTTP method for logging
 * @param handler - Controller handler function
 * @returns MCP tool handler function
 */
function createWriteHandler(
	methodName: string,
	handler: (options: RequestWithBodyArgsType) => Promise<{ content: string }>,
) {
	return async (args: Record<string, unknown>) => {
		const methodLogger = Logger.forContext(
			'tools/atlassian.api.tool.ts',
			methodName.toLowerCase(),
		);
		methodLogger.debug(`Making ${methodName} request with args:`, {
			path: args.path,
			bodyKeys: args.body ? Object.keys(args.body as object) : [],
		});

		try {
			const result = await handler(args as RequestWithBodyArgsType);

			methodLogger.debug(
				'Successfully received response from controller',
			);

			return {
				content: [
					{
						type: 'text' as const,
						text: result.content,
					},
				],
			};
		} catch (error) {
			methodLogger.error(`Failed to make ${methodName} request`, error);
			return formatErrorForMcpTool(error);
		}
	};
}

// Create tool handlers
const get = createReadHandler('GET', handleGet);
const post = createWriteHandler('POST', handlePost);
const put = createWriteHandler('PUT', handlePut);
const patch = createWriteHandler('PATCH', handlePatch);
const del = createReadHandler('DELETE', handleDelete);

/**
 * Register generic Jira API tools with the MCP server.
 */
function registerTools(server: McpServer) {
	const registerLogger = Logger.forContext(
		'tools/atlassian.api.tool.ts',
		'registerTools',
	);
	registerLogger.debug('Registering API tools...');

	// Register the GET tool
	server.tool(
		'jira_get',
		`Read any Jira data. Returns JSON, optionally filtered with JMESPath (\`jq\` param).

**Common paths:**
- \`/rest/api/3/project\` - list all projects
- \`/rest/api/3/project/{projectKeyOrId}\` - get project details
- \`/rest/api/3/search\` - search issues with JQL (use \`jql\` query param)
- \`/rest/api/3/issue/{issueIdOrKey}\` - get issue details
- \`/rest/api/3/issue/{issueIdOrKey}/comment\` - list issue comments
- \`/rest/api/3/issue/{issueIdOrKey}/worklog\` - list issue worklogs
- \`/rest/api/3/issue/{issueIdOrKey}/transitions\` - get available transitions
- \`/rest/api/3/user/search\` - search users (use \`query\` param)
- \`/rest/api/3/status\` - list all statuses
- \`/rest/api/3/issuetype\` - list issue types
- \`/rest/api/3/priority\` - list priorities

**Query params:** \`maxResults\` (page size), \`startAt\` (offset), \`jql\` (JQL query), \`fields\` (field selection), \`expand\` (include additional data)

**Example JQL queries:** \`project=PROJ\`, \`assignee=currentUser()\`, \`status="In Progress"\`, \`created >= -7d\`

API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/`,
		GetApiToolArgs.shape,
		get,
	);

	// Register the POST tool
	server.tool(
		'jira_post',
		`Create Jira resources. Returns JSON, optionally filtered with JMESPath (\`jq\` param).

**Common operations:**

1. **Create issue:** \`/rest/api/3/issue\`
   body: \`{"fields": {"project": {"key": "PROJ"}, "summary": "Issue title", "issuetype": {"name": "Task"}, "description": {"type": "doc", "version": 1, "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Description"}]}]}}}\`

2. **Add comment:** \`/rest/api/3/issue/{issueIdOrKey}/comment\`
   body: \`{"body": {"type": "doc", "version": 1, "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Comment text"}]}]}}\`

3. **Add worklog:** \`/rest/api/3/issue/{issueIdOrKey}/worklog\`
   body: \`{"timeSpentSeconds": 3600, "comment": {"type": "doc", "version": 1, "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Work done"}]}]}}\`

4. **Transition issue:** \`/rest/api/3/issue/{issueIdOrKey}/transitions\`
   body: \`{"transition": {"id": "31"}}\`

5. **Add attachment:** \`/rest/api/3/issue/{issueIdOrKey}/attachments\`
   Note: Requires multipart form data (complex - use Jira UI for attachments)

API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/`,
		RequestWithBodyArgs.shape,
		post,
	);

	// Register the PUT tool
	server.tool(
		'jira_put',
		`Replace Jira resources (full update). Returns JSON, optionally filtered with JMESPath (\`jq\` param).

**Common operations:**

1. **Update issue (full):** \`/rest/api/3/issue/{issueIdOrKey}\`
   body: \`{"fields": {"summary": "New title", "description": {...}, "assignee": {"accountId": "..."}}}\`

2. **Update project:** \`/rest/api/3/project/{projectIdOrKey}\`
   body: \`{"name": "New Project Name", "description": "Updated description"}\`

3. **Set issue property:** \`/rest/api/3/issue/{issueIdOrKey}/properties/{propertyKey}\`
   body: \`{"value": "property value"}\`

Note: PUT replaces the entire resource. For partial updates, prefer PATCH.

API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/`,
		RequestWithBodyArgs.shape,
		put,
	);

	// Register the PATCH tool
	server.tool(
		'jira_patch',
		`Partially update Jira resources. Returns JSON, optionally filtered with JMESPath (\`jq\` param).

**Common operations:**

1. **Update issue fields:** \`/rest/api/3/issue/{issueIdOrKey}\`
   body: \`{"fields": {"summary": "Updated title"}}\` (only updates specified fields)

2. **Update comment:** \`/rest/api/3/issue/{issueIdOrKey}/comment/{commentId}\`
   body: \`{"body": {"type": "doc", "version": 1, "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Updated comment"}]}]}}\`

3. **Update worklog:** \`/rest/api/3/issue/{issueIdOrKey}/worklog/{worklogId}\`
   body: \`{"timeSpentSeconds": 7200}\`

Note: PATCH only updates the fields you specify, leaving others unchanged.

API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/`,
		RequestWithBodyArgs.shape,
		patch,
	);

	// Register the DELETE tool
	server.tool(
		'jira_delete',
		`Delete Jira resources. Returns JSON (if any), optionally filtered with JMESPath (\`jq\` param).

**Common operations:**

1. **Delete issue:** \`/rest/api/3/issue/{issueIdOrKey}\`
   Query param: \`deleteSubtasks=true\` to delete subtasks

2. **Delete comment:** \`/rest/api/3/issue/{issueIdOrKey}/comment/{commentId}\`

3. **Delete worklog:** \`/rest/api/3/issue/{issueIdOrKey}/worklog/{worklogId}\`

4. **Delete attachment:** \`/rest/api/3/attachment/{attachmentId}\`

5. **Remove watcher:** \`/rest/api/3/issue/{issueIdOrKey}/watchers\`
   Query param: \`accountId={accountId}\`

Note: Most DELETE endpoints return 204 No Content on success.

API reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/`,
		DeleteApiToolArgs.shape,
		del,
	);

	registerLogger.debug('Successfully registered API tools');
}

export default { registerTools };
