import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import { ListIssuesToolArgsType, UpdateIssueToolArgsType } from '../tools/atlassian.issues.types.js';
import atlassianIssuesController from '../controllers/atlassian.issues.controller.js';
import atlassianIssuesUpdateController from '../controllers/atlassian.issues.update.controller.js';
import { formatHeading } from '../utils/formatter.util.js';

/**
 * CLI module for managing Jira issues.
 * Provides commands for listing issues and retrieving issue details.
 * All commands require valid Atlassian credentials.
 */

// Create a contextualized logger for this file
const cliLogger = Logger.forContext('cli/atlassian.issues.cli.ts');

// Log CLI module initialization
cliLogger.debug('Jira issues CLI module initialized');

/**
 * Register Jira Issues CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program: Command): void {
	const methodLogger = Logger.forContext(
		'cli/atlassian.issues.cli.ts',
		'register',
	);
	methodLogger.debug('Registering Jira Issues CLI commands...');

	registerListIssuesCommand(program);
	registerGetIssueCommand(program);
	registerUpdateIssueCommand(program);

	methodLogger.debug('CLI commands registered successfully');
}

/**
 * Register the command for listing Jira issues
 * @param program - The Commander program instance
 */
function registerListIssuesCommand(program: Command): void {
	program
		.command('ls-issues')
		.description(
			'Search for Jira issues using JQL (Jira Query Language), with pagination.',
		)
		.option(
			'-l, --limit <number>',
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results.',
			'25',
		)
		.option(
			'-c, --start-at <number>',
			'Index of the first item to return (0-based offset, starts at 0). Note: Jira uses offset-based pagination with startAt instead of cursor-based pagination used in other servers.',
		)
		.option(
			'-q, --jql <jql>',
			"Filter issues using JQL syntax (e.g., \"project = TEAM AND status = 'In Progress'\"). NOTE: JQL functions requiring user context (like currentUser()) may not work reliably with API token authentication and can cause errors; use explicit account IDs instead (e.g., assignee = 'accountid:...'). If omitted, returns issues according to your Jira default search.",
		)
		.option(
			'-p, --project-key-or-id <keyOrId>',
			'Filter by a specific project key or ID. If --jql is also provided, this will be ANDed with it (e.g., project = YOUR_KEY AND (YOUR_JQL)).',
		)
		.option(
			'-s, --statuses <statuses...>',
			'Filter by one or more status names (repeatable). Status names are case-sensitive and must match exactly as they appear in Jira (e.g., "In Progress", not "in progress"). Use the ls-statuses command first to find exact status names.',
		)
		.option(
			'-o, --order-by <field>',
			'JQL ORDER BY clause (e.g., "priority DESC"). If not provided and a JQL query without ORDER BY is given, default sort is "updated DESC".',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.issues.cli.ts',
				'ls-issues',
			);

			try {
				actionLogger.debug('Processing command options:', options);

				// Validate limit if provided
				let limit: number | undefined;
				if (options.limit) {
					limit = parseInt(options.limit, 10);
					if (isNaN(limit) || limit <= 0) {
						throw new Error(
							'Invalid --limit value: Must be a positive integer.',
						);
					}
				}

				// Validate startAt if provided
				let startAt: number | undefined;
				if (options.startAt !== undefined) {
					startAt = parseInt(options.startAt, 10);
					if (isNaN(startAt) || startAt < 0) {
						throw new Error(
							'Invalid --start-at value: Must be a non-negative integer.',
						);
					}
				}

				const filterOptions: ListIssuesToolArgsType = {
					...(options.jql && { jql: options.jql }),
					...(options.projectKeyOrId && {
						projectKeyOrId: options.projectKeyOrId,
					}),
					...(options.statuses && { statuses: options.statuses }),
					...(options.orderBy && { orderBy: options.orderBy }),
					...(limit !== undefined && { limit: limit }),
					...(startAt !== undefined && { startAt: startAt }),
				};

				actionLogger.debug(
					'Fetching issues with filters:',
					filterOptions,
				);

				const result =
					await atlassianIssuesController.list(filterOptions);

				actionLogger.debug('Successfully retrieved issues');

				// Print the main content
				console.log(formatHeading('Issues', 2));
				console.log(result.content);
			} catch (error) {
				actionLogger.error('Operation failed:', error);
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
			'Get detailed information about a specific Jira issue using its ID or key.',
		)
		.requiredOption(
			'-i, --issue-id-or-key <idOrKey>',
			'The ID or key of the Jira issue to retrieve (e.g., "10001" or "PROJ-123"). This is required and must be a valid issue ID or key from your Jira instance.',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.issues.cli.ts',
				'get-issue',
			);

			try {
				actionLogger.debug('Processing command options:', options);

				// Validate issue ID/key
				if (
					!options.issueIdOrKey ||
					options.issueIdOrKey.trim() === ''
				) {
					throw new Error('Issue ID or key must not be empty.');
				}

				actionLogger.debug(`Fetching issue: ${options.issueIdOrKey}`);

				const result = await atlassianIssuesController.get({
					issueIdOrKey: options.issueIdOrKey,
				});

				// Print the content
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

/**
 * Register the command for updating a Jira issue
 * @param program - The Commander program instance
 */
function registerUpdateIssueCommand(program: Command): void {
	program
		.command('update-issue')
		.description(
			'Update fields of an existing Jira issue using its ID or key. Supports standard and custom fields.',
		)
		.requiredOption(
			'-i, --issue-id-or-key <idOrKey>',
			'The ID or key of the Jira issue to update (e.g., "10001" or "PROJ-123"). This is required and must be a valid issue ID or key from your Jira instance.',
		)
		.option(
			'-s, --summary <summary>',
			'Update the issue summary/title.',
		)
		.option(
			'-d, --description <description>',
			'Update the issue description. Supports markdown format which will be converted to Atlassian Document Format (ADF).',
		)
		.option(
			'-p, --priority <priority>',
			'Update the issue priority. Can be priority ID (e.g., "1") or priority name (e.g., "High").',
		)
		.option(
			'-a, --assignee <assignee>',
			'Update the issue assignee. Should be the account ID of the user.',
		)
		.option(
			'-l, --labels <labels...>',
			'Update the issue labels. Provide multiple labels as separate arguments.',
		)
		.option(
			'-c, --components <components...>',
			'Update the issue components. Can be component IDs or names.',
		)
		.option(
			'-f, --fix-versions <versions...>',
			'Update the issue fix versions. Can be version IDs or names.',
		)
		.option(
			'--field <field=value>',
			'Update any field (standard or custom). Format: fieldName=value or customfield_10001=value. Can be used multiple times. Rich text fields support markdown.',
			(value, previous) => {
				const [field, ...valueParts] = value.split('=');
				const fieldValue = valueParts.join('='); // Rejoin in case value contains '='
				if (!field || fieldValue === undefined) {
					throw new Error('Field format should be: fieldName=value or customfield_10001=value');
				}
				return { ...previous, [field]: fieldValue };
			},
			{},
		)
		.option(
			'--fields <json>',
			'Update fields using JSON format. Example: \'{"summary":"New title","customfield_10001":"Custom value"}\'',
		)
		.option(
			'--notify-users',
			'Send notifications to users about the update (default: true).',
		)
		.option(
			'--no-notify-users',
			'Do not send notifications to users about the update.',
		)
		.option(
			'--return-issue',
			'Return the updated issue details in the response.',
		)
		.option(
			'--expand <fields...>',
			'Fields to expand in the response when --return-issue is used (e.g., changelog, renderedFields).',
		)
		.action(async (options) => {
			const actionLogger = Logger.forContext(
				'cli/atlassian.issues.cli.ts',
				'update-issue',
			);

			try {
				actionLogger.debug('Processing command options:', options);

				// Validate issue ID/key
				if (
					!options.issueIdOrKey ||
					options.issueIdOrKey.trim() === ''
				) {
					throw new Error('Issue ID or key must not be empty.');
				}

				// Build fields object
				const fields: Record<string, unknown> = {};
				
				// Add standard fields
				if (options.summary) {
					fields.summary = options.summary;
				}
				if (options.description) {
					fields.description = options.description;
				}
				if (options.priority) {
					fields.priority = options.priority;
				}
				if (options.assignee) {
					fields.assignee = options.assignee;
				}
				if (options.labels) {
					fields.labels = options.labels;
				}
				if (options.components) {
					fields.components = options.components;
				}
				if (options.fixVersions) {
					fields.fixVersions = options.fixVersions;
				}

				// Add fields from --field options
				if (options.field && Object.keys(options.field).length > 0) {
					Object.assign(fields, options.field);
				}

				// Parse JSON fields if provided
				if (options.fields) {
					try {
						const jsonFields = JSON.parse(options.fields);
						Object.assign(fields, jsonFields);
					} catch (error) {
						throw new Error(`Invalid JSON in --fields: ${error instanceof Error ? error.message : String(error)}`);
					}
				}

				// Build the update arguments
				const updateArgs: UpdateIssueToolArgsType = {
					issueIdOrKey: options.issueIdOrKey,
					...(Object.keys(fields).length > 0 && { fields }),
					notifyUsers: options.notifyUsers !== false, // Default to true unless explicitly set to false
					returnIssue: options.returnIssue || false,
					...(options.expand && { expand: options.expand }),
				};

				// Validate that at least some fields are being updated
				if (!updateArgs.fields) {
					throw new Error('No fields specified for update. Use options like --summary, --description, --field, or --fields.');
				}

				actionLogger.debug(`Updating issue: ${options.issueIdOrKey}`, updateArgs);

				const result = await atlassianIssuesUpdateController.updateIssue(updateArgs);

				actionLogger.debug('Successfully updated issue');

				// Print the content
				console.log(result.content);
			} catch (error) {
				actionLogger.error('Operation failed:', error);
				handleCliError(error);
			}
		});
}

export default { register };
