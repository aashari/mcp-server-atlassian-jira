import {
	Issue,
	IssueComment,
	IssueLink,
} from '../services/vendor.atlassian.issues.types.js';
import { adfToMarkdown } from '../utils/adf.util.js';
import {
	formatUrl,
	formatDate,
	formatHeading,
	formatBulletList,
	formatSeparator,
	formatNumberedList,
} from '../utils/formatter.util.js';

// Add this interface definition at the top of the file, after the imports
interface CommentContainer {
	comments: IssueComment[];
}

interface IssuesData {
	issues: Issue[];
	baseUrl: string;
}

interface ResponsePagination {
	nextCursor?: string;
	hasMore: boolean;
	count?: number;
}

/**
 * Format a list of issues for display
 * @param issuesData - Raw issues data from the API
 * @param pagination - Pagination information including count and next cursor
 * @returns Formatted string with issues information in markdown format
 */
export function formatIssuesList(
	issuesData: IssuesData,
	pagination?: ResponsePagination,
): string {
	const { issues } = issuesData;

	if (!issues || issues.length === 0) {
		return 'No issues found.';
	}

	const lines: string[] = [formatHeading('Jira Issues', 1), ''];

	const formattedIssues = formatNumberedList(issues, (issue) => {
		const lines: string[] = [];

		lines.push(formatHeading(`${issue.key}: ${issue.fields.summary}`, 2));

		const properties: Record<string, unknown> = {
			Key: issue.key,
			Summary: issue.fields.summary,
			Type: issue.fields.issuetype?.name,
			Status: issue.fields.status?.name,
			Priority: issue.fields.priority?.name,
			Project: issue.fields.project?.name,
			Assignee: issue.fields.assignee?.displayName,
			Reporter: issue.fields.reporter?.displayName,
			'Created On': issue.fields.created,
			'Updated On': issue.fields.updated,
			URL: {
				url: `${issuesData.baseUrl}/browse/${issue.key}`,
				title: issue.key,
			},
		};

		lines.push(formatBulletList(properties));

		return lines.join('\n');
	});

	lines.push(formattedIssues);

	if (pagination) {
		const paginationInfo = [];
		if (pagination.count !== undefined) {
			paginationInfo.push(`Total: ${pagination.count}`);
		}
		if (pagination.hasMore) {
			paginationInfo.push('Has more: Yes');
		}
		if (pagination.nextCursor) {
			paginationInfo.push(`Next cursor: ${pagination.nextCursor}`);
		}
		if (paginationInfo.length > 0) {
			lines.push('');
			lines.push(paginationInfo.join(' | '));
		}
	}

	return lines.join('\n');
}

/**
 * Format detailed issue information for display
 * @param issueData - Raw issue data from the API
 * @returns Formatted string with issue details in markdown format
 */
export function formatIssueDetails(issueData: Issue): string {
	// Prepare URL
	const issueUrl = issueData.self.replace('/rest/api/3/issue/', '/browse/');

	const lines: string[] = [
		formatHeading(`Jira Issue: ${issueData.fields.summary}`, 1),
		'',
	];

	// Add a brief summary line
	if (issueData.fields.status) {
		const summary = `> A ${issueData.fields.status.name.toLowerCase()} issue in the ${issueData.fields.project?.name} project.`;
		lines.push(summary);
		lines.push('');
	}

	// Basic Information section
	lines.push(formatHeading('Basic Information', 2));

	const basicProperties: Record<string, unknown> = {
		ID: issueData.id,
		Key: issueData.key,
		Project: issueData.fields.project
			? `${issueData.fields.project.name} (${issueData.fields.project.key})`
			: undefined,
		Type: issueData.fields.issuetype?.name,
		Status: issueData.fields.status?.name,
		Priority: issueData.fields.priority?.name,
	};

	lines.push(formatBulletList(basicProperties, (key) => key));

	// Add issue type description if available
	if (issueData.fields.issuetype?.description) {
		lines.push(`  *${issueData.fields.issuetype.description}*`);
	}

	// Description
	if (issueData.fields.description) {
		lines.push('');
		lines.push(formatHeading('Description', 2));

		// Handle different description formats
		if (typeof issueData.fields.description === 'string') {
			lines.push(issueData.fields.description);
		} else if (typeof issueData.fields.description === 'object') {
			lines.push(adfToMarkdown(issueData.fields.description));
		} else {
			lines.push('*Description format not supported*');
		}
	}

	// People
	lines.push('');
	lines.push(formatHeading('People', 2));

	const peopleProperties: Record<string, unknown> = {
		Assignee: issueData.fields.assignee?.displayName || 'Unassigned',
		Reporter: issueData.fields.reporter?.displayName,
	};

	// Add creator only if different from reporter
	if (
		issueData.fields.creator &&
		(!issueData.fields.reporter ||
			issueData.fields.creator.displayName !==
				issueData.fields.reporter?.displayName)
	) {
		peopleProperties['Creator'] = issueData.fields.creator.displayName;
	}

	lines.push(formatBulletList(peopleProperties, (key) => key));

	// Additional people details
	if (
		issueData.fields.assignee &&
		issueData.fields.assignee.active !== undefined
	) {
		lines.push(
			`  - **Active**: ${issueData.fields.assignee.active ? 'Yes' : 'No'}`,
		);
	}
	if (
		issueData.fields.reporter &&
		issueData.fields.reporter.active !== undefined
	) {
		lines.push(
			`  - **Active**: ${issueData.fields.reporter.active ? 'Yes' : 'No'}`,
		);
	}
	if (
		issueData.fields.creator &&
		(!issueData.fields.reporter ||
			issueData.fields.creator.displayName !==
				issueData.fields.reporter?.displayName) &&
		issueData.fields.creator.active !== undefined
	) {
		lines.push(
			`  - **Active**: ${issueData.fields.creator.active ? 'Yes' : 'No'}`,
		);
	}

	// Dates
	lines.push('');
	lines.push(formatHeading('Dates', 2));

	const dateProperties: Record<string, unknown> = {
		Created: issueData.fields.created,
		Updated: issueData.fields.updated,
	};

	lines.push(formatBulletList(dateProperties, (key) => key));

	// Time tracking
	if (
		issueData.fields.timetracking &&
		(issueData.fields.timetracking.originalEstimate ||
			issueData.fields.timetracking.remainingEstimate ||
			issueData.fields.timetracking.timeSpent)
	) {
		lines.push('');
		lines.push(formatHeading('Time Tracking', 2));

		const timeTrackingProperties: Record<string, unknown> = {
			'Original Estimate': issueData.fields.timetracking.originalEstimate,
			'Remaining Estimate':
				issueData.fields.timetracking.remainingEstimate,
			'Time Spent': issueData.fields.timetracking.timeSpent,
		};

		lines.push(formatBulletList(timeTrackingProperties, (key) => key));
	}

	// Attachments
	if (issueData.fields.attachment && issueData.fields.attachment.length > 0) {
		lines.push('');
		lines.push(formatHeading('Attachments', 2));

		issueData.fields.attachment.forEach((attachment, index) => {
			lines.push(formatHeading(attachment.filename, 3));

			const attachmentProperties: Record<string, unknown> = {
				'Content Type': attachment.mimeType,
				Size: formatFileSize(attachment.size),
				'Created At': attachment.created,
				Author: attachment.author?.displayName,
			};

			lines.push(formatBulletList(attachmentProperties, (key) => key));

			if (attachment.content) {
				lines.push(`[Download](${attachment.content})`);
			}

			// Add separator between attachments
			if (index < issueData.fields.attachment!.length - 1) {
				lines.push('');
			}
		});
	}

	// Comments
	if (issueData.fields.comment) {
		const comments = Array.isArray(issueData.fields.comment)
			? issueData.fields.comment
			: (issueData.fields.comment as CommentContainer).comments || [];

		if (comments.length > 0) {
			lines.push('');
			lines.push(formatHeading('Comments', 2));

			comments.forEach((comment: IssueComment, index: number) => {
				lines.push(
					formatHeading(
						`${comment.author?.displayName || 'Anonymous'} - ${formatDate(comment.created)}`,
						3,
					),
				);

				// Format comment body
				if (typeof comment.body === 'string') {
					lines.push(comment.body);
				} else if (typeof comment.body === 'object') {
					lines.push(adfToMarkdown(comment.body));
				}

				// Add separator between comments
				if (index < comments.length - 1) {
					lines.push('');
					lines.push(formatSeparator());
					lines.push('');
				}
			});
		}
	}

	// Issue Links
	if (issueData.fields.issuelinks && issueData.fields.issuelinks.length > 0) {
		lines.push('');
		lines.push(formatHeading('Issue Links', 2));

		const issueLinks = issueData.fields.issuelinks;
		issueLinks.forEach((link: IssueLink) => {
			const relatedIssue = link.outwardIssue || link.inwardIssue;
			if (relatedIssue) {
				const linkType = link.outwardIssue
					? link.type.outward
					: link.type.inward;
				const relatedIssueUrl = relatedIssue.self.replace(
					'/rest/api/3/issue/',
					'/browse/',
				);

				lines.push(
					`- ${linkType} ${formatUrl(relatedIssueUrl, relatedIssue.key)}: ${(relatedIssue.fields as { summary?: string })?.summary || 'No summary'}`,
				);
			}
		});
	}

	// Links section
	lines.push('');
	lines.push(formatHeading('Links', 2));
	lines.push(`- ${formatUrl(issueUrl, 'Open in Jira')}`);

	// Footer
	lines.push('');
	lines.push(formatSeparator());
	lines.push(`*Issue information retrieved at ${formatDate(new Date())}*`);
	lines.push(`*To view this issue in Jira, visit: ${issueUrl}*`);

	return lines.join('\n');
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
