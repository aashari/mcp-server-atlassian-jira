import atlassianProjectsService from '../services/vendor.atlassian.projects.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { createApiError } from '../utils/error.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import {
	ListProjectsOptions,
	ProjectIdentifier,
} from './atlassian.projects.types.js';
import {
	formatProjectsList,
	formatProjectDetails,
} from './atlassian.projects.formatter.js';
import {
	DEFAULT_PAGE_SIZE,
	applyDefaults,
	PROJECT_DEFAULTS,
} from '../utils/defaults.util.js';

/**
 * Controller for managing Jira projects.
 * Provides functionality for listing projects and retrieving project details.
 */

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.projects.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Jira projects controller initialized');

/**
 * Lists Jira projects with pagination and filtering options
 * @param options - Options for listing projects
 * @returns Formatted list of projects with pagination information
 */
async function list(
	options: ListProjectsOptions = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.projects.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Jira projects...', options);

	try {
		// Create a defaults object with proper typing
		const defaults: Partial<ListProjectsOptions> = {
			limit: DEFAULT_PAGE_SIZE,
			orderBy: 'lastIssueUpdatedTime',
			cursor: '',
		};

		// Apply defaults
		const mergedOptions = applyDefaults<ListProjectsOptions>(
			options,
			defaults,
		);

		// Map controller options to service parameters
		const serviceParams = {
			// Optional filters
			query: mergedOptions.name,
			// Always include expanded fields
			expand: ['description', 'lead'],
			// Default sorting by last update time if not specified
			orderBy: mergedOptions.orderBy,
			// Pagination with defaults
			maxResults: mergedOptions.limit,
			startAt: mergedOptions.cursor
				? parseInt(mergedOptions.cursor, 10)
				: 0,
		};

		const projectsData = await atlassianProjectsService.list(serviceParams);
		// Log only the count of projects returned instead of the entire response
		methodLogger.debug(
			`Retrieved ${projectsData.values?.length || 0} projects`,
		);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			projectsData as unknown as Record<string, unknown>,
			PaginationType.OFFSET,
			'controllers/atlassian.projects.controller.ts@list',
		);

		// Format the projects data for display using the formatter
		const formattedProjects = formatProjectsList(projectsData, pagination);

		return {
			content: formattedProjects,
			pagination,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Projects',
			operation: 'listing',
			source: 'controllers/atlassian.projects.controller.ts@list',
			additionalInfo: { options },
		});
	}
}

/**
 * Gets details of a specific Jira project
 * @param identifier - The project identifier
 * @returns Formatted project details
 */
async function get(identifier: ProjectIdentifier): Promise<ControllerResponse> {
	const { projectKeyOrId } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.projects.controller.ts',
		'get',
	);

	methodLogger.debug(
		`Getting Jira project with key/ID: ${projectKeyOrId}...`,
	);

	// Validate project key/ID format
	if (!projectKeyOrId || projectKeyOrId === 'invalid') {
		throw createApiError('Invalid project key or ID', 400);
	}

	try {
		// Create defaults object for get operation
		const defaults = {
			includeComponents: PROJECT_DEFAULTS.INCLUDE_COMPONENTS,
			includeVersions: PROJECT_DEFAULTS.INCLUDE_VERSIONS,
		};

		// Always include all possible expansions for maximum detail
		const serviceParams = defaults;

		const projectData = await atlassianProjectsService.get(
			projectKeyOrId,
			serviceParams,
		);
		// Log only key information instead of the entire response
		methodLogger.debug(
			`Retrieved project: ${projectData.name} (${projectData.id})`,
		);

		// Format the project data for display using the formatter
		const formattedProject = formatProjectDetails(projectData);

		return {
			content: formattedProject,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Project',
			entityId: identifier,
			operation: 'retrieving',
			source: 'controllers/atlassian.projects.controller.ts@get',
		});
	}
}

export default { list, get };
