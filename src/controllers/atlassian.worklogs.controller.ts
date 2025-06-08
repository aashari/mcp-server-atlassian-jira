import { Logger } from '../utils/logger.util.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import {
  handleControllerError,
  buildErrorContext,
} from '../utils/error-handler.util.js';
import { ControllerResponse } from '../types/common.types.js';
import {
  AddWorklogParams,
  GetWorklogsParams,
  WorklogResponse,
  Worklog,
} from '../tools/atlassian.worklogs.types.js';
import { fetchAtlassian } from '../utils/transport.util.js';

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
  'controllers/atlassian.worklogs.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Jira worklogs controller initialized');

async function getWorklogs(
  params: GetWorklogsParams,
): Promise<ControllerResponse> {
  const methodLogger = Logger.forContext(
    'controllers/atlassian.worklogs.controller.ts',
    'getWorklogs',
  );
  methodLogger.debug(`Getting worklogs for issue: ${params.issueIdOrKey}`);

  try {
    const credentials = getAtlassianCredentials();
    if (!credentials) {
      throw new Error('Atlassian credentials are required for this operation');
    }

    const data = await fetchAtlassian<WorklogResponse>(
      credentials,
      `/rest/api/3/issue/${params.issueIdOrKey}/worklog`,
      { method: 'GET' }
    );

    return {
      content: `# Worklogs for ${params.issueIdOrKey}\n\n${formatWorklogs(data.worklogs)}`,
    };
  } catch (error) {
    return handleControllerError(
      error,
      buildErrorContext(
        'Worklog',
        'getWorklogs',
        'controllers/atlassian.worklogs.controller.ts',
        params.issueIdOrKey
      )
    );
  }
}

async function addWorklog(
  params: AddWorklogParams,
): Promise<ControllerResponse> {
  const methodLogger = Logger.forContext(
    'controllers/atlassian.worklogs.controller.ts',
    'addWorklog',
  );
  methodLogger.debug(`Adding worklog to issue: ${params.issueIdOrKey}`);

  try {
    const credentials = getAtlassianCredentials();
    if (!credentials) {
      throw new Error('Atlassian credentials are required for this operation');
    }

    const payload = {
      timeSpentSeconds: params.timeSpentSeconds,
      started: params.started || new Date().toISOString(),
      comment: params.comment
        ? {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: params.comment,
                  },
                ],
              },
            ],
          }
        : undefined,
    };

    /* const data =*/ await fetchAtlassian<Worklog>(
      credentials,
      `/rest/api/3/issue/${params.issueIdOrKey}/worklog`,
      {
        method: 'POST',
        body: payload,
      }
    );

    return {
      content: `# Worklog Added Successfully\n\nWorklog has been added to issue ${params.issueIdOrKey}\n\n## Details\n- Time Spent: ${formatSeconds(params.timeSpentSeconds)}\n- Started: ${params.started || 'Now'}\n${params.comment ? `- Comment: ${params.comment}` : ''}`,
    };
  } catch (error) {
    return handleControllerError(
      error,
      buildErrorContext(
        'Worklog',
        'addWorklog',
        'controllers/atlassian.worklogs.controller.ts',
        params.issueIdOrKey
      )
    );
  }
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

function formatWorklogs(worklogs: any[]): string {
  if (!worklogs || worklogs.length === 0) {
    return '*No worklogs found*';
  }

  return worklogs.map(worklog => {
    const timeSpent = formatSeconds(worklog.timeSpentSeconds);
    const author = worklog.author.displayName;
    const started = new Date(worklog.started).toISOString();
    const comment = worklog.comment?.content?.[0]?.content?.[0]?.text || 'No comment';

    return `## Worklog by ${author}\n- Time Spent: ${timeSpent}\n- Started: ${started}\n- Comment: ${comment}\n`;
  }).join('\n');
}

export default {
  getWorklogs,
  addWorklog,
};