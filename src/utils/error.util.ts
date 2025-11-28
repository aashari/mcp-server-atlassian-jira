import { Logger } from './logger.util.js';

/**
 * Format a simple separator line
 */
function formatSeparator(): string {
	return '---';
}

/**
 * Error types for classification
 */
export enum ErrorType {
	AUTH_MISSING = 'AUTH_MISSING',
	AUTH_INVALID = 'AUTH_INVALID',
	API_ERROR = 'API_ERROR',
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Custom error class with type classification
 */
export class McpError extends Error {
	type: ErrorType;
	statusCode?: number;
	originalError?: unknown;

	constructor(
		message: string,
		type: ErrorType,
		statusCode?: number,
		originalError?: unknown,
	) {
		super(message);
		this.name = 'McpError';
		this.type = type;
		this.statusCode = statusCode;
		this.originalError = originalError;
	}
}

/**
 * Create an authentication missing error
 */
export function createAuthMissingError(
	message: string = 'Authentication credentials are missing',
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.AUTH_MISSING,
		undefined,
		originalError,
	);
}

/**
 * Create an authentication invalid error
 */
export function createAuthInvalidError(
	message: string = 'Authentication credentials are invalid',
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.AUTH_INVALID, 401, originalError);
}

/**
 * Create an API error
 */
export function createApiError(
	message: string,
	statusCode?: number,
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.API_ERROR,
		statusCode,
		originalError,
	);
}

/**
 * Create an unexpected error
 */
export function createUnexpectedError(
	message: string = 'An unexpected error occurred',
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.UNEXPECTED_ERROR,
		undefined,
		originalError,
	);
}

/**
 * Create a not found error
 */
export function createNotFoundError(
	message: string = 'Resource not found',
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.API_ERROR, 404, originalError);
}

/**
 * Ensure an error is an McpError
 */
export function ensureMcpError(error: unknown): McpError {
	if (error instanceof McpError) {
		return error;
	}

	if (error instanceof Error) {
		return createUnexpectedError(error.message, error);
	}

	return createUnexpectedError(String(error));
}

/**
 * Get the deepest original error from an error chain
 * @param error The error to extract the original cause from
 * @returns The deepest original error or the error itself
 */
export function getDeepOriginalError(error: unknown): unknown {
	if (!error) {
		return error;
	}

	let current = error;
	let depth = 0;
	const maxDepth = 10; // Prevent infinite recursion

	while (
		depth < maxDepth &&
		current instanceof Error &&
		'originalError' in current &&
		current.originalError
	) {
		current = current.originalError;
		depth++;
	}

	return current;
}

/**
 * Format error for MCP tool response with vendor detail for AI.
 */
export function formatErrorForMcpTool(error: unknown): {
	content: Array<{ type: 'text'; text: string }>;
	metadata: {
		errorType: ErrorType;
		statusCode?: number;
		errorDetails?: unknown;
	};
} {
	const methodLogger = Logger.forContext(
		'utils/error.util.ts',
		'formatErrorForMcpTool',
	);
	const mcpError = ensureMcpError(error);

	methodLogger.error(`${mcpError.type} error`, mcpError);

	// Get the deep original error for additional context
	const originalError = getDeepOriginalError(mcpError.originalError);

	// Create a detailed message including the original error information
	let detailedMessage = `Error: ${mcpError.message}`;

	// Safely extract details from the original error
	const errorDetails =
		originalError instanceof Error
			? { message: originalError.message }
			: originalError;

	// Add Jira-specific error handling for display
	if (originalError) {
		let vendorText = '';
		if (originalError instanceof Error) {
			vendorText = originalError.message;
		} else if (typeof originalError === 'object') {
			vendorText = JSON.stringify(originalError);
		} else {
			vendorText = String(originalError);
		}

		if (!detailedMessage.includes(vendorText)) {
			detailedMessage += `\nJira API Error: ${vendorText}`;
		}
	}

	return {
		content: [{ type: 'text' as const, text: detailedMessage }],
		metadata: {
			errorType: mcpError.type,
			statusCode: mcpError.statusCode,
			errorDetails,
		},
	};
}

/**
 * Format error for MCP resource response
 */
export function formatErrorForMcpResource(
	error: unknown,
	uri: string,
): {
	contents: Array<{
		uri: string;
		text: string;
		mimeType: string;
		description?: string;
	}>;
} {
	const methodLogger = Logger.forContext(
		'utils/error.util.ts',
		'formatErrorForMcpResource',
	);
	const mcpError = ensureMcpError(error);

	methodLogger.error(`${mcpError.type} error`, mcpError);

	return {
		contents: [
			{
				uri,
				text: `Error: ${mcpError.message}`,
				mimeType: 'text/plain',
				description: `Error: ${mcpError.type}`,
			},
		],
	};
}

/**
 * Handle error in CLI context
 */
export function handleCliError(error: unknown): never {
	const methodLogger = Logger.forContext(
		'utils/error.util.ts',
		'handleCliError',
	);
	const mcpError = ensureMcpError(error);

	// Log detailed information at different levels based on error type
	if (mcpError.statusCode && mcpError.statusCode >= 500) {
		methodLogger.error(`${mcpError.type} error occurred`, {
			message: mcpError.message,
			statusCode: mcpError.statusCode,
			stack: mcpError.stack,
		});
	} else {
		methodLogger.warn(`${mcpError.type} error occurred`, {
			message: mcpError.message,
			statusCode: mcpError.statusCode,
		});
	}

	// Log additional debug information if DEBUG is enabled
	methodLogger.debug('Error details', {
		type: mcpError.type,
		statusCode: mcpError.statusCode,
		originalError: mcpError.originalError,
		stack: mcpError.stack,
	});

	// Build structured CLI output
	const cliLines: string[] = [];
	cliLines.push(`❌  ${mcpError.message}`);

	if (mcpError.statusCode) {
		cliLines.push(`HTTP Status: ${mcpError.statusCode}`);
	}

	// Provide helpful context based on error type
	if (mcpError.type === ErrorType.AUTH_MISSING) {
		cliLines.push(
			'\nTip: Make sure to set up your Atlassian credentials in the environment variables:',
		);
		cliLines.push('- ATLASSIAN_SITE_NAME');
		cliLines.push('- ATLASSIAN_USER_EMAIL');
		cliLines.push('- ATLASSIAN_API_TOKEN');
	} else if (mcpError.type === ErrorType.AUTH_INVALID) {
		cliLines.push(
			'\nTip: Check that your Atlassian API token is correct and has not expired.',
		);
		cliLines.push(
			'Verify your user has the required permissions to access the requested resource.',
		);
	} else if (
		mcpError.type === ErrorType.API_ERROR &&
		mcpError.statusCode === 429
	) {
		cliLines.push(
			'\nTip: You may have exceeded Jira API rate limits. Try again later or space out your requests.',
		);
	} else if (
		mcpError.type === ErrorType.VALIDATION_ERROR &&
		mcpError.message.includes('JQL')
	) {
		cliLines.push(
			'\nTip: Check your JQL syntax. Functions like currentUser() may not work with API token authentication.',
		);
		cliLines.push(
			"Use explicit account IDs instead (e.g., assignee = 'accountid:...').",
		);
	}

	cliLines.push(formatSeparator());

	// Include the deep original error details
	const deepOriginal = getDeepOriginalError(mcpError.originalError);
	if (deepOriginal) {
		cliLines.push('Jira API Error:');
		let vendorText = '';
		if (deepOriginal instanceof Error) {
			vendorText = deepOriginal.message;
		} else if (typeof deepOriginal === 'object') {
			vendorText = JSON.stringify(deepOriginal, null, 2);
		} else {
			vendorText = String(deepOriginal);
		}
		cliLines.push('```json');
		cliLines.push(vendorText.trim());
		cliLines.push('```');
	}

	// Display DEBUG tip
	if (!process.env.DEBUG) {
		cliLines.push(
			'\nFor detailed error information, run with DEBUG=mcp:* environment variable.',
		);
	}

	console.error(cliLines.join('\n'));
	process.exit(1);
}
