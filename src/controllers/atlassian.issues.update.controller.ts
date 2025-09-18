import { Logger } from '../utils/logger.util.js';
import { ControllerResponse } from '../types/common.types.js';
import atlassianIssuesService from '../services/vendor.atlassian.issues.service.js';
import { formatUpdateIssueResponse } from './atlassian.issues.update.formatter.js';
import { UpdateIssueParams } from '../services/vendor.atlassian.issues.types.js';
import { UpdateIssueToolArgsType } from '../tools/atlassian.issues.types.js';
import { markdownToAdf } from '../utils/adf-from-markdown.util.js';

/**
 * Controller for updating Jira issues.
 * Provides functionality for updating issue fields including custom fields.
 */

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.issues.update.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Jira issues update controller initialized');

/**
 * Update a Jira issue
 * @param args Arguments containing issue update data
 * @returns Formatted update issue response
 */
async function updateIssue(args: UpdateIssueToolArgsType): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.issues.update.controller.ts',
		'updateIssue',
	);

	methodLogger.debug('Updating issue:', args);

	// Build the fields object for issue update
	const fields: Record<string, unknown> = {};

	// Process fields and handle ADF conversion for rich text fields
	if (args.fields) {
		for (const [fieldName, value] of Object.entries(args.fields)) {
			if (typeof value === 'string' && value.trim()) {
				// Check if this is a rich text field that needs ADF conversion
				const isRichTextField = fieldName === 'description' || 
					(fieldName.startsWith('customfield_') && 
					 // For custom fields, try ADF conversion first and fall back if it fails
					 // This handles cases where we can't reliably detect rich text fields
					 true); // Always attempt ADF conversion for custom fields
				
				if (isRichTextField) {
					// Try to convert string values to ADF for rich text fields
					try {
						fields[fieldName] = markdownToAdf(value);
						methodLogger.debug(`Converted field ${fieldName} to ADF format`);
					} catch (error) {
						// If ADF conversion fails, use the original value
						// The API will return an error if it's not the right format
						fields[fieldName] = value;
						methodLogger.debug(`Using original value for field ${fieldName}: ${error instanceof Error ? error.message : String(error)}`);
					}
				} else {
					// Non-rich-text string fields - use as-is
					fields[fieldName] = value;
				}
			} else {
				// Non-string values or empty strings - use as-is
				fields[fieldName] = value;
			}
		}
	}

	// Handle special field transformations (non-ADF fields)

	// Handle priority field - support both ID and name
	if (fields.priority) {
		if (typeof fields.priority === 'string') {
			// Try as ID first, then as name
			if (/^\d+$/.test(fields.priority)) {
				fields.priority = { id: fields.priority };
			} else {
				fields.priority = { name: fields.priority };
			}
		}
	}

	// Handle assignee field
	if (fields.assignee) {
		if (typeof fields.assignee === 'string') {
			// Assume account ID format
			fields.assignee = { accountId: fields.assignee };
		}
	}

	// Handle components field
	if (fields.components && Array.isArray(fields.components)) {
		fields.components = fields.components.map((comp) => {
			if (typeof comp === 'string') {
				// Try as ID first, then as name
				if (/^\d+$/.test(comp)) {
					return { id: comp };
				} else {
					return { name: comp };
				}
			}
			return comp;
		});
	}

	// Handle fixVersions field
	if (fields.fixVersions && Array.isArray(fields.fixVersions)) {
		fields.fixVersions = fields.fixVersions.map((version) => {
			if (typeof version === 'string') {
				// Try as ID first, then as name
				if (/^\d+$/.test(version)) {
					return { id: version };
				} else {
					return { name: version };
				}
			}
			return version;
		});
	}

	const updateParams: UpdateIssueParams = {
		fields: Object.keys(fields).length > 0 ? fields : undefined,
		update: args.update,
		notifyUsers: args.notifyUsers ?? true, // Default to true
		returnIssue: args.returnIssue ?? false, // Default to false
		expand: args.expand,
	};

	methodLogger.debug('Calling service to update issue with params:', updateParams);

	const response = await atlassianIssuesService.updateIssue(args.issueIdOrKey, updateParams);

	methodLogger.debug('Updated issue successfully:', response);

	return {
		content: formatUpdateIssueResponse(response, args.issueIdOrKey, args.returnIssue),
	};
}

export default {
	updateIssue,
};
