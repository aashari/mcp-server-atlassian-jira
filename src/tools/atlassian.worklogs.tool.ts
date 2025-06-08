import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
  AddWorklogParams,
  GetWorklogsParams,
} from './atlassian.worklogs.types.js';
import atlassianWorklogsController from '../controllers/atlassian.worklogs.controller.js';

// Create a contextualized logger for this file
const toolLogger = Logger.forContext('tools/atlassian.worklogs.tool.ts');

// Log tool module initialization
toolLogger.debug('Jira worklogs tool module initialized');

/**
 * MCP Tool: Get Jira Worklogs
 *
 * Retrieves worklogs for a specific Jira issue.
 * Returns a formatted markdown response with worklog details.
 *
 * @param {GetWorklogsParams} args - Tool arguments containing the issue ID/key
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted worklogs
 * @throws Will return error message if worklog retrieval fails
 */
async function getWorklogs(args: GetWorklogsParams) {
  const methodLogger = Logger.forContext(
    'tools/atlassian.worklogs.tool.ts',
    'getWorklogs',
  );
  methodLogger.debug(`Retrieving worklogs for issue: ${args.issueIdOrKey}`);

  try {
    const result = await atlassianWorklogsController.getWorklogs(args);
    methodLogger.debug('Successfully retrieved worklogs');

    return {
      content: [
        {
          type: 'text' as const,
          text: result.content,
        },
      ],
    };
  } catch (error) {
    methodLogger.error('Failed to get worklogs', error);
    return formatErrorForMcpTool(error);
  }
}

/**
 * MCP Tool: Add Jira Worklog
 *
 * Adds a new worklog to a specific Jira issue.
 * Returns a formatted markdown response confirming the addition.
 *
 * @param {AddWorklogParams} args - Tool arguments containing worklog details
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with confirmation
 * @throws Will return error message if worklog addition fails
 */
async function addWorklog(args: AddWorklogParams) {
  const methodLogger = Logger.forContext(
    'tools/atlassian.worklogs.tool.ts',
    'addWorklog',
  );
  methodLogger.debug(`Adding worklog to issue: ${args.issueIdOrKey}`);

  try {
    const result = await atlassianWorklogsController.addWorklog(args);
    methodLogger.debug('Successfully added worklog');

    return {
      content: [
        {
          type: 'text' as const,
          text: result.content,
        },
      ],
    };
  } catch (error) {
    methodLogger.error('Failed to add worklog', error);
    return formatErrorForMcpTool(error);
  }
}

/**
 * Register Atlassian Worklogs MCP Tools
 *
 * Registers the get-worklogs and add-worklog tools with the MCP server.
 * Each tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function registerTools(server: McpServer) {
  const methodLogger = Logger.forContext(
    'tools/atlassian.worklogs.tool.ts',
    'registerTools',
  );
  methodLogger.debug('Registering Atlassian Worklogs tools...');

  // Register the get worklogs tool
  server.tool(
    'jira_ls_worklogs',
    `Lists worklogs for a specific Jira issue. Returns a formatted list of worklogs including author, time spent, start time, and comments.`,
    GetWorklogsParams.shape,
    getWorklogs,
  );

  // Register the add worklog tool
  server.tool(
    'jira_add_worklog',
    `Adds a new worklog to a specific Jira issue. Requires the issue ID/key and time spent in seconds. Optionally accepts a comment and start time.`,
    AddWorklogParams.shape,
    addWorklog,
  );

  methodLogger.debug('Successfully registered Atlassian Worklogs tools');
}

export default { registerTools };