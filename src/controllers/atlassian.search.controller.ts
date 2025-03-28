import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { applyDefaults, DEFAULT_PAGE_SIZE } from '../utils/defaults.util.js';
import { ControllerResponse } from '../types/common.types.js';

import atlassianIssuesController from './atlassian.issues.controller.js';

/**
 * Search options interface
 * Defines the parameters for searching Jira content
 */
export interface SearchOptions {
	jql?: string;
	limit?: number;
	cursor?: string;
}

/**
 * Search for Jira issues using JQL
 *
 * @param {SearchOptions} options - Options for the search
 * @returns {Promise<ControllerResponse>} Formatted search results in Markdown
 */
async function search(
	options: SearchOptions = {},
): Promise<ControllerResponse> {
	const controllerLogger = Logger.forContext(
		'controllers/atlassian.search.controller.ts',
		'search',
	);
	controllerLogger.debug('Searching Jira content with options:', options);

	try {
		// Apply defaults to options
		const mergedOptions = applyDefaults<SearchOptions>(options, {
			limit: DEFAULT_PAGE_SIZE,
			jql: '',
		});

		// Search issues using the issues controller
		const result = await atlassianIssuesController.list({
			jql: mergedOptions.jql,
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
		});

		// Format the search results
		const formattedContent = `# Jira Search Results\n\n${mergedOptions.jql ? `**JQL Query:** \`${mergedOptions.jql}\`\n\n` : ''}${result.content}`;

		controllerLogger.debug(
			'Successfully retrieved and formatted search results',
			{
				count: result.pagination?.count,
				hasMore: result.pagination?.hasMore,
			},
		);

		return {
			content: formattedContent,
			pagination: result.pagination,
		};
	} catch (error) {
		return handleControllerError(error, {
			source: 'Jira',
			operation: 'search',
			entityType: 'issues',
		});
	}
}

export default {
	search,
};
