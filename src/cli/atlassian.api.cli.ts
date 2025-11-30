import { Command } from 'commander';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import {
	handleGet,
	handlePost,
	handlePut,
	handlePatch,
	handleDelete,
} from '../controllers/atlassian.api.controller.js';

/**
 * CLI module for generic Jira API access.
 * Provides commands for making GET, POST, PUT, PATCH, and DELETE requests to any Jira API endpoint.
 */

// Create a contextualized logger for this file
const cliLogger = Logger.forContext('cli/atlassian.api.cli.ts');

// Log CLI initialization
cliLogger.debug('Jira API CLI module initialized');

/**
 * Parse JSON string with error handling and basic validation
 * @param jsonString - JSON string to parse
 * @param fieldName - Name of the field for error messages
 * @returns Parsed JSON object
 */
function parseJson<T extends Record<string, unknown>>(
	jsonString: string,
	fieldName: string,
): T {
	let parsed: unknown;
	try {
		parsed = JSON.parse(jsonString);
	} catch {
		throw new Error(
			`Invalid JSON in --${fieldName}. Please provide valid JSON.`,
		);
	}

	// Validate that the parsed value is an object (not null, array, or primitive)
	if (
		parsed === null ||
		typeof parsed !== 'object' ||
		Array.isArray(parsed)
	) {
		throw new Error(
			`Invalid --${fieldName}: expected a JSON object, got ${parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed}.`,
		);
	}

	return parsed as T;
}

/**
 * Register a read command (GET/DELETE - no body)
 * @param program - Commander program instance
 * @param name - Command name
 * @param description - Command description
 * @param handler - Controller handler function
 */
function registerReadCommand(
	program: Command,
	name: string,
	description: string,
	handler: (options: {
		path: string;
		queryParams?: Record<string, string>;
		jq?: string;
		outputFormat?: 'toon' | 'json';
	}) => Promise<{ content: string }>,
): void {
	program
		.command(name)
		.description(description)
		.requiredOption(
			'-p, --path <path>',
			'API endpoint path (e.g., "/rest/api/3/project", "/rest/api/3/issue/{issueKey}").',
		)
		.option(
			'-q, --query-params <json>',
			'Query parameters as JSON string (e.g., \'{"maxResults": "50"}\').',
		)
		.option(
			'--jq <expression>',
			'JMESPath expression to filter/transform the response.',
		)
		.option(
			'--output-format <format>',
			'Output format: "toon" (default, token-efficient) or "json".',
			'toon',
		)
		.action(async (options) => {
			const actionLogger = cliLogger.forMethod(name);
			try {
				actionLogger.debug(`CLI ${name} called`, options);

				// Parse query params if provided
				let queryParams: Record<string, string> | undefined;
				if (options.queryParams) {
					queryParams = parseJson<Record<string, string>>(
						options.queryParams,
						'query-params',
					);
				}

				const result = await handler({
					path: options.path,
					queryParams,
					jq: options.jq,
					outputFormat: options.outputFormat as 'toon' | 'json',
				});

				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

/**
 * Register a write command (POST/PUT/PATCH - with body)
 * @param program - Commander program instance
 * @param name - Command name
 * @param description - Command description
 * @param handler - Controller handler function
 */
function registerWriteCommand(
	program: Command,
	name: string,
	description: string,
	handler: (options: {
		path: string;
		body: Record<string, unknown>;
		queryParams?: Record<string, string>;
		jq?: string;
		outputFormat?: 'toon' | 'json';
	}) => Promise<{ content: string }>,
): void {
	program
		.command(name)
		.description(description)
		.requiredOption(
			'-p, --path <path>',
			'API endpoint path (e.g., "/rest/api/3/issue", "/rest/api/3/issue/{issueKey}/comment").',
		)
		.requiredOption('-b, --body <json>', 'Request body as JSON string.')
		.option('-q, --query-params <json>', 'Query parameters as JSON string.')
		.option(
			'--jq <expression>',
			'JMESPath expression to filter/transform the response.',
		)
		.option(
			'--output-format <format>',
			'Output format: "toon" (default, token-efficient) or "json".',
			'toon',
		)
		.action(async (options) => {
			const actionLogger = cliLogger.forMethod(name);
			try {
				actionLogger.debug(`CLI ${name} called`, options);

				// Parse body
				const body = parseJson<Record<string, unknown>>(
					options.body,
					'body',
				);

				// Parse query params if provided
				let queryParams: Record<string, string> | undefined;
				if (options.queryParams) {
					queryParams = parseJson<Record<string, string>>(
						options.queryParams,
						'query-params',
					);
				}

				const result = await handler({
					path: options.path,
					body,
					queryParams,
					jq: options.jq,
					outputFormat: options.outputFormat as 'toon' | 'json',
				});

				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});
}

/**
 * Register generic Jira API CLI commands with the Commander program
 *
 * @param program - The Commander program instance to register commands with
 */
function register(program: Command): void {
	const methodLogger = Logger.forContext(
		'cli/atlassian.api.cli.ts',
		'register',
	);
	methodLogger.debug('Registering Jira API CLI commands...');

	// Register GET command
	registerReadCommand(
		program,
		'get',
		'GET any Jira endpoint. Returns TOON by default (or JSON with --output-format json), optionally filtered with JMESPath.',
		handleGet,
	);

	// Register POST command
	registerWriteCommand(
		program,
		'post',
		'POST to any Jira endpoint. Returns TOON by default (or JSON with --output-format json), optionally filtered with JMESPath.',
		handlePost,
	);

	// Register PUT command
	registerWriteCommand(
		program,
		'put',
		'PUT to any Jira endpoint. Returns TOON by default (or JSON with --output-format json), optionally filtered with JMESPath.',
		handlePut,
	);

	// Register PATCH command
	registerWriteCommand(
		program,
		'patch',
		'PATCH any Jira endpoint. Returns TOON by default (or JSON with --output-format json), optionally filtered with JMESPath.',
		handlePatch,
	);

	// Register DELETE command
	registerReadCommand(
		program,
		'delete',
		'DELETE any Jira endpoint. Returns TOON by default (or JSON with --output-format json, if any), optionally filtered with JMESPath.',
		handleDelete,
	);

	methodLogger.debug('CLI commands registered successfully');
}

export default { register };
