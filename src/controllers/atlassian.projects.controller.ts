import atlassianProjectsService from '../services/vendor.atlassian.projects.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/errorHandler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import {
	ListProjectsOptions,
	GetProjectOptions,
	ControllerResponse,
	ProjectIdentifier,
} from './atlassian.projects.type.js';
import {
	formatProjectsList,
	formatProjectDetails,
} from './atlassian.projects.formatter.js';

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
 * List Jira projects with optional filtering
 * @param options - Optional filter options for the projects list
 * @param options.query - Text query to filter projects by name or key
 * @param options.limit - Maximum number of projects to return
 * @param options.cursor - Pagination cursor for retrieving the next set of results
 * @returns Promise with formatted project list content and pagination information
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
		// Set default filters and hardcoded values
		const filters = {
			// Optional filters with defaults
			query: options.query,
			// Hardcoded choices
			expand: ['description', 'lead'], // Always include expanded fields
			// Pagination
			maxResults: options.limit || 50,
			startAt: options.cursor ? parseInt(options.cursor, 10) : 0,
		};

		methodLogger.debug('Using filters:', filters);

		const projectsData = await atlassianProjectsService.list(filters);
		// Log only the count of projects returned instead of the entire response
		methodLogger.debug(
			`Retrieved ${projectsData.values?.length || 0} projects`,
		);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			projectsData,
			PaginationType.OFFSET,
			'controllers/atlassian.projects.controller.ts@list',
		);

		// Format the projects data for display using the formatter
		const formattedProjects = formatProjectsList(
			projectsData,
			pagination.nextCursor,
		);

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
 * Get details of a specific Jira project
 * @param identifier - Object containing the ID or key of the project to retrieve
 * @param identifier.idOrKey - The ID or key of the project
 * @param options - Options for retrieving the project
 * @returns Promise with formatted project details content
 * @throws Error if project retrieval fails
 */
async function get(
	identifier: ProjectIdentifier,
	options: GetProjectOptions = {
		includeComponents: true,
		includeVersions: true,
	},
): Promise<ControllerResponse> {
	const { idOrKey } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.projects.controller.ts',
		'get',
	);

	methodLogger.debug(`Getting Jira project with ID/key: ${idOrKey}...`);

	try {
		methodLogger.debug('Using options:', options);

		const projectData = await atlassianProjectsService.get(
			idOrKey,
			options,
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
			additionalInfo: { options },
		});
	}
}

export default { list, get };
