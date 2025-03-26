import atlassianProjectsService from '../services/vendor.atlassian.projects.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import {
	ListProjectsOptions,
	GetProjectOptions,
	ProjectIdentifier,
} from './atlassian.projects.type.js';
import {
	formatProjectsList,
	formatProjectDetails,
} from './atlassian.projects.formatter.js';
import {
	DEFAULT_PAGE_SIZE,
	PROJECT_DEFAULTS,
	applyDefaults,
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
	options: ListProjectsOptions = {
		limit: DEFAULT_PAGE_SIZE,
	},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.projects.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Jira projects...', options);

	try {
		// Map controller options to service parameters
		const serviceParams = {
			// Optional filters
			query: options.query,
			// Always include expanded fields
			expand: ['description', 'lead'],
			// Pagination with defaults
			maxResults: options.limit || DEFAULT_PAGE_SIZE,
			startAt: options.cursor ? parseInt(options.cursor, 10) : 0,
		};

		const projectsData = await atlassianProjectsService.list(serviceParams);
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
		const formattedProjects = formatProjectsList(projectsData);

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
 * @param options - Options for retrieving project details
 * @returns Formatted project details
 */
async function get(
	identifier: ProjectIdentifier,
	options: GetProjectOptions = {},
): Promise<ControllerResponse> {
	const { idOrKey } = identifier;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.projects.controller.ts',
		'get',
	);

	methodLogger.debug(`Getting Jira project with ID/key: ${idOrKey}...`);

	try {
		// Apply default values to options
		const optionsWithDefaults = applyDefaults(options, {
			includeComponents: PROJECT_DEFAULTS.INCLUDE_COMPONENTS,
			includeVersions: PROJECT_DEFAULTS.INCLUDE_VERSIONS,
		});

		// Map controller options to service parameters
		const serviceParams = {
			includeComponents: optionsWithDefaults.includeComponents,
			includeVersions: optionsWithDefaults.includeVersions,
		};

		const projectData = await atlassianProjectsService.get(
			idOrKey,
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
			additionalInfo: { options },
		});
	}
}

export default { list, get };
