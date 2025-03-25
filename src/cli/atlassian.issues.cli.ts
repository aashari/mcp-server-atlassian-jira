import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import atlassianIssuesController from '../controllers/atlassian.issues.controller.js';
import { ListIssuesOptions } from '../controllers/atlassian.issues.type.js';

/**
 * CLI module for managing Jira issues.
 * Provides commands for listing issues and retrieving issue details.
 * All commands require valid Atlassian credentials.
 */

/**
 * Register Jira Issues CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const logPrefix = '[src/cli/atlassian.issues.cli.ts@register]';
	logger.debug(`${logPrefix} Registering Jira Issues CLI commands...`);

	registerListIssuesCommand(program);
	registerGetIssueCommand(program);

	logger.debug(`${logPrefix} CLI commands registered successfully`);
}

/**
 * Register the command for listing Jira issues
 * @param program - The Commander program instance
 */
function registerListIssuesCommand(program: Command): void {
	program
		.command('list-issues')
		.description(
			'List Jira issues with optional filtering\n\n  Retrieves issues from your Jira instance with JQL filtering and pagination options.',
		)
		.option('-j, --jql <query>', 'JQL query string to filter issues')
		.option(
			'-l, --limit <number>',
			'Maximum number of issues to return (1-100). Use this to control the response size. If omitted, defaults to 50.',
		)
		.option(
			'-c, --cursor <cursor>',
			'Pagination cursor for retrieving the next set of results. Obtain this value from the previous response when more results are available.',
		)
		.action(async (options) => {
			const logPrefix = '[src/cli/atlassian.issues.cli.ts@list-issues]';
			try {
				logger.debug(
					`${logPrefix} Processing command options:`,
					options,
				);

				const filterOptions: ListIssuesOptions = {
					...(options.jql && { jql: options.jql }),
					...(options.limit && {
						limit: parseInt(options.limit, 10),
					}),
					...(options.cursor && { cursor: options.cursor }),
				};

				logger.debug(
					`${logPrefix} Fetching issues with filters:`,
					filterOptions,
				);
				const result =
					await atlassianIssuesController.list(filterOptions);
				logger.debug(`${logPrefix} Successfully retrieved issues`);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

/**
 * Register the command for retrieving a specific Jira issue
 * @param program - The Commander program instance
 */
function registerGetIssueCommand(program: Command): void {
	program
		.command('get-issue')
		.description(
			'Get detailed information about a specific Jira issue\n\n  Retrieves comprehensive details for an issue including status, comments, attachments, and metadata.',
		)
		.argument('<idOrKey>', 'ID or key of the issue to retrieve')
		.action(async (idOrKey: string) => {
			const logPrefix = '[src/cli/atlassian.issues.cli.ts@get-issue]';
			try {
				logger.debug(
					`${logPrefix} Fetching details for issue ID/key: ${idOrKey}`,
				);
				const result = await atlassianIssuesController.get({ idOrKey });
				logger.debug(
					`${logPrefix} Successfully retrieved issue details`,
				);

				console.log(result.content);
			} catch (error) {
				logger.error(`${logPrefix} Operation failed:`, error);
				handleCliError(error);
			}
		});
}

export default { register };
