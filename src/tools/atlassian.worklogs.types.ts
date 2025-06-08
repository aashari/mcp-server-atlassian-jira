import { z } from 'zod';

export const GetWorklogsParams = z.object({
  issueIdOrKey: z.string().min(1).describe('The ID or key of the Jira issue to get worklogs from (e.g., "PROJ-123" or "10001").'),
});

export const AddWorklogParams = z.object({
  issueIdOrKey: z.string().min(1).describe('The ID or key of the Jira issue to add a worklog to (e.g., "PROJ-123" or "10001").'),
  timeSpentSeconds: z.number().min(1).describe('Time spent in seconds. For example, use 3600 for 1 hour.'),
  comment: z.string().optional().describe('Optional comment to add to the worklog.'),
  started: z.string().optional().describe('Optional start time in ISO 8601 format. Defaults to now if not provided.'),
});

export type GetWorklogsParams = z.infer<typeof GetWorklogsParams>;
export type AddWorklogParams = z.infer<typeof AddWorklogParams>;

export interface Worklog {
  id: string;
  timeSpentSeconds: number;
  started: string;
  author: {
    accountId: string;
    displayName: string;
  };
  comment?: {
    type: string;
    version: number;
    content: Array<{
      type: string;
      content: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export interface DeleteWorklogParams {
  issueIdOrKey: string;
  worklogId: string;
}

export interface UpdateWorklogParams extends AddWorklogParams {
  worklogId: string;
}

export interface WorklogResponse {
  worklogs: Worklog[];
}