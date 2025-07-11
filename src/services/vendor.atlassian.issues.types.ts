/**
 * Types for Atlassian Jira Issues API
 */
import { z } from 'zod';

/**
 * Issue status schema
 */
const IssueStatusSchema = z.object({
	iconUrl: z.string(),
	name: z.string(),
});

/**
 * Issue link type schema
 */
const IssueLinkTypeSchema = z.object({
	id: z.string(),
	inward: z.string(),
	name: z.string(),
	outward: z.string(),
});

/**
 * Represents the minimal information about a linked issue provided within an IssueLink.
 */
const LinkedIssueInfoSchema = z.object({
	id: z.string(),
	key: z.string(),
	self: z.string(),
	fields: z
		.object({
			summary: z.string().optional(),
			status: IssueStatusSchema,
		})
		.passthrough(), // Allow additional fields
});

/**
 * Issue link schema
 */
const IssueLinkSchema = z.object({
	id: z.string(),
	type: IssueLinkTypeSchema,
	inwardIssue: LinkedIssueInfoSchema.optional(),
	outwardIssue: LinkedIssueInfoSchema.optional(),
});

/**
 * Issue attachment schema
 */
const IssueAttachmentSchema = z.object({
	id: z.string(),
	self: z.string(),
	filename: z.string(),
	author: z.object({
		accountId: z.string(),
		accountType: z.string().optional(),
		active: z.boolean(),
		displayName: z.string(),
		self: z.string(),
		avatarUrls: z.record(z.string()).optional(),
	}),
	created: z.string(),
	size: z.number(),
	mimeType: z.string(),
	content: z.string(),
	thumbnail: z.string().optional(),
});

/**
 * Issue comment schema
 */
const IssueCommentSchema = z.object({
	id: z.string(),
	self: z.string(),
	author: z.object({
		accountId: z.string(),
		active: z.boolean(),
		displayName: z.string(),
		self: z.string(),
	}),
	body: z.union([z.string(), z.any()]), // ContentRepresentation
	created: z.string(),
	updated: z.string(),
	updateAuthor: z.object({
		accountId: z.string(),
		active: z.boolean(),
		displayName: z.string(),
		self: z.string(),
	}),
	visibility: z
		.object({
			identifier: z.string(),
			type: z.string(),
			value: z.string(),
		})
		.optional(),
});

/**
 * Issue comment container schema - Jira API sometimes returns this as an object with nested arrays instead of a direct array
 */
const IssueCommentContainerSchema = z
	.object({
		comments: z.array(IssueCommentSchema).optional(),
		maxResults: z.number().optional(),
		total: z.number().optional(),
		startAt: z.number().optional(),
	})
	.passthrough();

/**
 * Comments pagination response schema - used when retrieving comments for an issue
 */
const PageOfCommentsSchema = z.object({
	comments: z.array(IssueCommentSchema),
	maxResults: z.number(),
	total: z.number(),
	startAt: z.number(),
});
export type PageOfComments = z.infer<typeof PageOfCommentsSchema>;

/**
 * Atlassian Document Format (ADF) document schema
 * Simplified version of the full ADF schema focusing on the minimal required structure
 */
const AdfDocumentSchema = z.object({
	version: z.number(),
	type: z.literal('doc'),
	content: z.array(
		z.object({
			type: z.string(),
			content: z.array(z.any()).optional(),
			text: z.string().optional(),
			attrs: z.record(z.any()).optional(),
		}),
	),
});
export type AdfDocument = z.infer<typeof AdfDocumentSchema>;

/**
 * Comment body for creating/updating comments
 * Can be either ADF document object or a simple string (converted to ADF)
 */
const CommentBodySchema = z.union([
	AdfDocumentSchema,
	z.object({
		body: z.union([z.string(), AdfDocumentSchema]),
	}),
]);
export type CommentBody = z.infer<typeof CommentBodySchema>;

/**
 * Parameters for listing comments
 */
export interface ListCommentsParams {
	startAt?: number;
	maxResults?: number;
	orderBy?: string;
	expand?: string[];
}

/**
 * Parameters for adding a comment
 */
export interface AddCommentParams {
	body: CommentBody;
	visibility?: {
		type: string;
		value: string;
	};
	expand?: string[];
}

/**
 * Issue worklog schema
 */
export const IssueWorklogSchema = z.object({
	id: z.string(),
	self: z.string(),
	author: z.object({
		accountId: z.string(),
		active: z.boolean(),
		displayName: z.string(),
		self: z.string(),
	}),
	comment: z.union([z.string(), z.any()]), // ContentRepresentation
	created: z.string(),
	updated: z.string(),
	issueId: z.string(),
	started: z.string(),
	timeSpent: z.string(),
	timeSpentSeconds: z.number(),
	updateAuthor: z.object({
		accountId: z.string(),
		active: z.boolean(),
		displayName: z.string(),
		self: z.string(),
	}),
	visibility: z
		.object({
			identifier: z.string(),
			type: z.string(),
			value: z.string(),
		})
		.optional(),
});

/**
 * Issue worklog container schema - Jira API sometimes returns this as an object with nested arrays instead of a direct array
 */
const IssueWorklogContainerSchema = z
	.object({
		worklogs: z.array(IssueWorklogSchema).optional(),
		maxResults: z.number().optional(),
		total: z.number().optional(),
		startAt: z.number().optional(),
	})
	.passthrough();

/**
 * Issue time tracking schema
 */
const IssueTimeTrackingSchema = z.object({
	originalEstimate: z.string().optional(),
	originalEstimateSeconds: z.number().optional(),
	remainingEstimate: z.string().optional(),
	remainingEstimateSeconds: z.number().optional(),
	timeSpent: z.string().optional(),
	timeSpentSeconds: z.number().optional(),
});

/**
 * Issue watcher schema
 */
const IssueWatcherSchema = z.object({
	isWatching: z.boolean(),
	self: z.string(),
	watchCount: z.number(),
});

/**
 * Issue fields schema
 */
const IssueFieldsSchema = z
	.object({
		watcher: IssueWatcherSchema.optional(),
		attachment: z.array(IssueAttachmentSchema).optional(),
		description: z.union([z.string(), z.any()]).optional(), // ContentRepresentation
		project: z.object({
			id: z.string(),
			key: z.string(),
			name: z.string(),
			self: z.string(),
			avatarUrls: z.record(z.string()),
			simplified: z.boolean(),
			insight: z
				.object({
					lastIssueUpdateTime: z.string(),
					totalIssueCount: z.number(),
				})
				.optional(),
			projectCategory: z
				.object({
					id: z.string(),
					name: z.string(),
					description: z.string().optional(),
					self: z.string(),
				})
				.optional(),
		}),
		// Accept either an array of comments or a comment container object
		comment: z
			.union([z.array(IssueCommentSchema), IssueCommentContainerSchema])
			.optional(),
		issuelinks: z.array(IssueLinkSchema).optional(),
		// Accept either an array of worklogs or a worklog container object
		worklog: z
			.union([z.array(IssueWorklogSchema), IssueWorklogContainerSchema])
			.optional(),
		updated: z.union([z.string(), z.number()]).optional(),
		timetracking: IssueTimeTrackingSchema.optional(),
		summary: z.string().optional(),
		status: IssueStatusSchema.optional(),
		// Make assignee accept null values
		assignee: z
			.object({
				accountId: z.string(),
				active: z.boolean(),
				displayName: z.string(),
				self: z.string(),
				avatarUrls: z.record(z.string()).optional(),
			})
			.nullable(),
		priority: z
			.object({
				id: z.string(),
				name: z.string(),
				iconUrl: z.string(),
				self: z.string(),
			})
			.optional(),
		issuetype: z
			.object({
				id: z.string(),
				name: z.string(),
				description: z.string(),
				iconUrl: z.string(),
				self: z.string(),
				subtask: z.boolean(),
				avatarId: z.number().optional(),
				hierarchyLevel: z.number().optional(),
			})
			.optional(),
		creator: z
			.object({
				accountId: z.string(),
				active: z.boolean(),
				displayName: z.string(),
				self: z.string(),
				avatarUrls: z.record(z.string()).optional(),
			})
			.optional(),
		reporter: z
			.object({
				accountId: z.string(),
				active: z.boolean(),
				displayName: z.string(),
				self: z.string(),
				avatarUrls: z.record(z.string()).optional(),
			})
			.nullable(),
		created: z.string().optional(),
		labels: z.array(z.string()).optional(),
		components: z
			.array(
				z.object({
					id: z.string(),
					name: z.string(),
					self: z.string(),
				}),
			)
			.optional(),
		fixVersions: z
			.array(
				z.object({
					id: z.string(),
					name: z.string(),
					self: z.string(),
					released: z.boolean(),
					archived: z.boolean(),
					releaseDate: z.string().optional(),
				}),
			)
			.optional(),
	})
	.passthrough(); // Allow additional fields for custom fields

/**
 * Issue object returned from the API
 */
const IssueSchema = z.object({
	id: z.string(),
	key: z.string(),
	self: z.string(),
	expand: z.string().optional(),
	fields: IssueFieldsSchema,
});
export type Issue = z.infer<typeof IssueSchema>;

/**
 * Parameters for searching issues
 */
export interface SearchIssuesParams {
	jql?: string;
	startAt?: number;
	maxResults?: number;
	fields?: string[];
	expand?: string[];
	validateQuery?: boolean;
	properties?: string[];
	fieldsByKeys?: boolean;
	nextPageToken?: string;
	reconcileIssues?: boolean;
}

/**
 * Parameters for getting an issue by ID or key
 */
export interface GetIssueByIdParams {
	fields?: string[];
	expand?: string[];
	properties?: string[];
	fieldsByKeys?: boolean;
	updateHistory?: boolean;
}

/**
 * API response for searching issues
 */
const IssuesResponseSchema = z.object({
	expand: z.string().optional(),
	startAt: z.number(),
	maxResults: z.number(),
	total: z.number(),
	issues: z.array(IssueSchema),
	warningMessages: z.array(z.string()).optional(),
	names: z.record(z.string()).optional(),
	schema: z.record(z.unknown()).optional(),
	nextPageToken: z.string().optional(),
});
export type IssuesResponse = z.infer<typeof IssuesResponseSchema>;

/**
 * Development information for issues
 */
const DevInfoCommitSchema = z.object({
	id: z.string(),
	displayId: z.string(),
	message: z.string(),
	author: z
		.object({
			name: z.string(),
			avatar: z.string().optional(),
		})
		.optional(),
	authorTimestamp: z.string(),
	url: z.string(),
	fileCount: z.number(),
	merge: z.boolean(),
	files: z.array(z.unknown()),
});

const DevInfoRepositorySchema = z.object({
	id: z.string(),
	name: z.string(),
	avatar: z.string(),
	url: z.string(),
	commits: z.array(DevInfoCommitSchema).optional(),
});

const DevInfoBranchSchema = z.object({
	name: z.string(),
	url: z.string(),
	createPullRequestUrl: z.string(),
	repository: z
		.object({
			id: z.string(),
			name: z.string(),
			avatar: z.string(),
			url: z.string(),
		})
		.optional(),
	lastCommit: DevInfoCommitSchema.optional(),
});

const DevInfoReviewerSchema = z.object({
	name: z.string(),
	avatar: z.string().optional(),
	approved: z.boolean(),
});

const DevInfoPullRequestSchema = z.object({
	id: z.string(),
	name: z.string(),
	commentCount: z.number(),
	source: z
		.object({
			branch: z.string(),
			url: z.string(),
		})
		.optional(),
	destination: z
		.object({
			branch: z.string(),
			url: z.string(),
		})
		.optional(),
	reviewers: z.array(DevInfoReviewerSchema).optional(),
	status: z.string(),
	url: z.string(),
	lastUpdate: z.string(),
	repositoryId: z.string(),
	repositoryName: z.string(),
	repositoryUrl: z.string(),
	repositoryAvatarUrl: z.string(),
	author: z
		.object({
			name: z.string(),
			avatar: z.string().optional(),
		})
		.optional(),
});

const DevInfoInstanceSchema = z.object({
	singleInstance: z.boolean(),
	baseUrl: z.string(),
	name: z.string(),
	typeName: z.string(),
	id: z.string(),
	type: z.string(),
});

const DevInfoDetailSchema = z.object({
	repositories: z.array(DevInfoRepositorySchema).optional(),
	branches: z.array(DevInfoBranchSchema).optional(),
	pullRequests: z.array(DevInfoPullRequestSchema).optional(),
	_instance: DevInfoInstanceSchema.optional(),
});

const DevInfoResponseSchema = z.object({
	errors: z.array(z.string()),
	detail: z.array(DevInfoDetailSchema),
});
export type DevInfoResponse = z.infer<typeof DevInfoResponseSchema>;

const DevInfoSummaryRepositorySchema = z.object({
	count: z.number(),
	lastUpdated: z.string().nullable(),
	dataType: z.string(),
});

const DevInfoSummaryPullRequestSchema = z.object({
	count: z.number(),
	lastUpdated: z.string().nullable(),
	stateCount: z.number(),
	state: z.string().nullable(),
	dataType: z.string(),
	open: z.boolean(),
});

const DevInfoSummaryBranchSchema = z.object({
	count: z.number(),
	lastUpdated: z.string().nullable(),
	dataType: z.string(),
});

const DevInfoSummaryDataSchema = z.object({
	pullrequest: z.object({
		overall: DevInfoSummaryPullRequestSchema,
		byInstanceType: z.record(
			z.object({
				count: z.number(),
				name: z.string(),
			}),
		),
	}),
	repository: z.object({
		overall: DevInfoSummaryRepositorySchema,
		byInstanceType: z.record(
			z.object({
				count: z.number(),
				name: z.string(),
			}),
		),
	}),
	branch: z.object({
		overall: DevInfoSummaryBranchSchema,
		byInstanceType: z.record(
			z.object({
				count: z.number(),
				name: z.string(),
			}),
		),
	}),
});

const DevInfoSummaryResponseSchema = z.object({
	errors: z.array(z.string()),
	configErrors: z.array(z.string()),
	summary: DevInfoSummaryDataSchema,
});
export type DevInfoSummaryResponse = z.infer<
	typeof DevInfoSummaryResponseSchema
>;

// Export schemas needed by the service implementation
export {
	IssueSchema,
	IssueFieldsSchema,
	IssuesResponseSchema,
	DevInfoResponseSchema,
	DevInfoSummaryResponseSchema,
	PageOfCommentsSchema,
	IssueCommentSchema,
	CommentBodySchema,
};
