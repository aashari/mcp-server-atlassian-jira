import { UpdateIssueResponse } from '../services/vendor.atlassian.issues.types.js';
import { formatIssueDetails } from './atlassian.issues.details.formatter.js';

/**
 * Format the response from updating a Jira issue
 * @param response The update issue response from the API
 * @param issueIdOrKey The issue ID or key that was updated
 * @param returnedIssue Whether the full issue was returned
 * @returns Formatted markdown string
 */
export function formatUpdateIssueResponse(
	response: UpdateIssueResponse,
	issueIdOrKey: string,
	returnedIssue?: boolean,
): string {
	const lines: string[] = [];

	// Add success header
	lines.push('# ✅ Issue Updated Successfully');
	lines.push('');

	// Show the issue key/ID
	const issueKey = response.key || issueIdOrKey;
	lines.push(`**Issue:** ${issueKey}`);
	
	if (response.id) {
		lines.push(`**Issue ID:** ${response.id}`);
	}

	if (response.self) {
		lines.push(`**Issue URL:** ${response.self}`);
	}

	lines.push('');

	// If the full issue was returned, format it
	if (returnedIssue && response.fields) {
		lines.push('## Updated Issue Details');
		lines.push('');
		
		// Create a mock issue object for the formatter
		const issueForFormatting = {
			id: response.id || '',
			key: issueKey,
			self: response.self || '',
			fields: response.fields as any, // Type assertion since we know this comes from Jira API
		};
		
		const formattedIssue = formatIssueDetails(issueForFormatting);
		lines.push(formattedIssue);
	} else {
		lines.push('✨ The issue has been updated successfully.');
		lines.push('');
		lines.push('💡 **Tip:** Use `returnIssue: true` to see the updated issue details in the response.');
	}

	return lines.join('\n');
}
