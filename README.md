# Connect AI to Your Jira Projects

Transform how you manage and track your work by connecting Claude, Cursor AI, and other AI assistants directly to your Jira projects, issues, and workflows. Get instant project insights, streamline issue management, and enhance your team collaboration.

[![NPM Version](https://img.shields.io/npm/v/@aashari/mcp-server-atlassian-jira)](https://www.npmjs.com/package/@aashari/mcp-server-atlassian-jira)

## What You Can Do

- **Ask AI about your projects**: "What are the active issues in the DEV project?"
- **Get issue insights**: "Show me details about PROJ-123 including comments"
- **Track project progress**: "List all high priority issues assigned to me"
- **Manage issue comments**: "Add a comment to PROJ-456 about the test results"
- **Search across projects**: "Find all bugs in progress across my projects"
- **Create and update issues**: "Create a new bug in the MOBILE project"

## Perfect For

- **Developers** who need quick access to issue details and development context
- **Project Managers** tracking progress, priorities, and team assignments
- **Scrum Masters** managing sprints and workflow states
- **Team Leads** monitoring project health and issue resolution
- **QA Engineers** tracking bugs and testing status
- **Anyone** who wants to interact with Jira using natural language

## Quick Start

Get up and running in 2 minutes:

### 1. Get Your Jira Credentials

Generate a Jira API Token:
1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a name like **"AI Assistant"**
4. **Copy the generated token** immediately (you won't see it again!)

### 2. Try It Instantly

```bash
# Set your credentials
export ATLASSIAN_SITE_NAME="your-company"  # for your-company.atlassian.net
export ATLASSIAN_USER_EMAIL="your.email@company.com"
export ATLASSIAN_API_TOKEN="your_api_token"

# List your Jira projects
npx -y @aashari/mcp-server-atlassian-jira get --path "/rest/api/3/project/search"

# Get details about a specific project
npx -y @aashari/mcp-server-atlassian-jira get --path "/rest/api/3/project/DEV"

# Get an issue with JMESPath filtering
npx -y @aashari/mcp-server-atlassian-jira get --path "/rest/api/3/issue/PROJ-123" --jq "{key: key, summary: fields.summary, status: fields.status.name}"
```

## Connect to AI Assistants

### For Claude Desktop Users

Add this to your Claude configuration file (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@aashari/mcp-server-atlassian-jira"],
      "env": {
        "ATLASSIAN_SITE_NAME": "your-company",
        "ATLASSIAN_USER_EMAIL": "your.email@company.com",
        "ATLASSIAN_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

Restart Claude Desktop, and you'll see the jira server in the status bar.

### For Other AI Assistants

Most AI assistants support MCP. Install the server globally:

```bash
npm install -g @aashari/mcp-server-atlassian-jira
```

Then configure your AI assistant to use the MCP server with STDIO transport.

### Alternative: Configuration File

Create `~/.mcp/configs.json` for system-wide configuration:

```json
{
  "jira": {
    "environments": {
      "ATLASSIAN_SITE_NAME": "your-company",
      "ATLASSIAN_USER_EMAIL": "your.email@company.com",
      "ATLASSIAN_API_TOKEN": "your_api_token"
    }
  }
}
```

**Alternative config keys:** The system also accepts `"atlassian-jira"`, `"@aashari/mcp-server-atlassian-jira"`, or `"mcp-server-atlassian-jira"` instead of `"jira"`.

## Available Tools

This MCP server provides 5 generic tools that can access any Jira API endpoint:

| Tool | Description |
|------|-------------|
| `jira_get` | GET any Jira API endpoint (read data) |
| `jira_post` | POST to any endpoint (create resources) |
| `jira_put` | PUT to any endpoint (replace resources) |
| `jira_patch` | PATCH any endpoint (partial updates) |
| `jira_delete` | DELETE any endpoint (remove resources) |

### Common API Paths

**Projects:**
- `/rest/api/3/project/search` - List all projects (paginated, recommended)
- `/rest/api/3/project` - List all projects (non-paginated, legacy)
- `/rest/api/3/project/{projectKeyOrId}` - Get project details

**Issues:**
- `/rest/api/3/search/jql` - Search issues with JQL (use `jql` query param). **IMPORTANT:** `/rest/api/3/search` is deprecated!
- `/rest/api/3/issue/{issueIdOrKey}` - Get issue details
- `/rest/api/3/issue` - Create issue (POST)
- `/rest/api/3/issue/{issueIdOrKey}/transitions` - Get/perform transitions

**Comments:**
- `/rest/api/3/issue/{issueIdOrKey}/comment` - List/add comments
- `/rest/api/3/issue/{issueIdOrKey}/comment/{commentId}` - Get/update/delete comment

**Worklogs:**
- `/rest/api/3/issue/{issueIdOrKey}/worklog` - List/add worklogs
- `/rest/api/3/issue/{issueIdOrKey}/worklog/{worklogId}` - Get/update/delete worklog

**Users & Statuses:**
- `/rest/api/3/myself` - Get current user
- `/rest/api/3/user/search` - Search users (use `query` param)
- `/rest/api/3/status` - List all statuses
- `/rest/api/3/issuetype` - List issue types
- `/rest/api/3/priority` - List priorities

### TOON Output Format

By default, all responses use **TOON (Token-Oriented Object Notation)** format, which reduces token usage by 30-60% compared to JSON. TOON uses tabular arrays and minimal syntax, making it ideal for AI consumption.

**To use JSON instead:** Add `--output-format json` to CLI commands or set `outputFormat: "json"` in MCP tool calls.

**Example TOON vs JSON:**
```
TOON: key|summary|status
      PROJ-1|First issue|Open
      PROJ-2|Second issue|Done

JSON: [{"key":"PROJ-1","summary":"First issue","status":"Open"},
       {"key":"PROJ-2","summary":"Second issue","status":"Done"}]
```

### JMESPath Filtering

All tools support optional JMESPath (`jq`) filtering to extract specific data:

```bash
# Get just project names and keys
npx -y @aashari/mcp-server-atlassian-jira get \
  --path "/rest/api/3/project/search" \
  --jq "values[].{key: key, name: name}"

# Get issue key and summary
npx -y @aashari/mcp-server-atlassian-jira get \
  --path "/rest/api/3/issue/PROJ-123" \
  --jq "{key: key, summary: fields.summary, status: fields.status.name}"
```

### Response Truncation and Raw Logs

For large API responses (>40k characters ≈ 10k tokens), responses are automatically truncated with guidance. The complete raw response is saved to `/tmp/mcp/mcp-server-atlassian-jira/<timestamp>-<random>.txt` for reference.

**When truncated, you'll see:**
- A truncation notice with the raw file path
- Suggestions to refine your query with better filters
- Percentage of data shown vs total size

## Real-World Examples

### Explore Your Projects

Ask your AI assistant:
- *"List all projects I have access to"*
- *"Show me details about the DEV project"*
- *"What projects contain the word 'Platform'?"*

### Search and Track Issues

Ask your AI assistant:
- *"Find all high priority issues in the DEV project"*
- *"Show me issues assigned to me that are in progress"*
- *"Search for bugs reported in the last week"*
- *"List all open issues for the mobile team"*

### Manage Issue Details

Ask your AI assistant:
- *"Get full details about issue PROJ-456 including comments"*
- *"What's the current status and assignee of PROJ-123?"*
- *"Display all comments on the authentication bug"*

### Issue Communication

Ask your AI assistant:
- *"Add a comment to PROJ-456: 'Code review completed, ready for testing'"*
- *"Comment on the login issue that it's been deployed to staging"*

## CLI Commands

The CLI mirrors the MCP tools for direct terminal access:

```bash
# GET request (returns TOON format by default)
npx -y @aashari/mcp-server-atlassian-jira get --path "/rest/api/3/project/search"

# GET with query parameters and JSON output
npx -y @aashari/mcp-server-atlassian-jira get \
  --path "/rest/api/3/search/jql" \
  --query-params '{"jql": "project=DEV AND status=\"In Progress\"", "maxResults": "10"}' \
  --output-format json

# GET with JMESPath filtering to extract specific fields
npx -y @aashari/mcp-server-atlassian-jira get \
  --path "/rest/api/3/issue/PROJ-123" \
  --jq "{key: key, summary: fields.summary, status: fields.status.name}"

# POST request (create an issue)
npx -y @aashari/mcp-server-atlassian-jira post \
  --path "/rest/api/3/issue" \
  --body '{"fields": {"project": {"key": "DEV"}, "summary": "New issue title", "issuetype": {"name": "Task"}}}'

# POST request (add a comment)
npx -y @aashari/mcp-server-atlassian-jira post \
  --path "/rest/api/3/issue/PROJ-123/comment" \
  --body '{"body": {"type": "doc", "version": 1, "content": [{"type": "paragraph", "content": [{"type": "text", "text": "My comment"}]}]}}'

# PUT request (update issue - full replacement)
npx -y @aashari/mcp-server-atlassian-jira put \
  --path "/rest/api/3/issue/PROJ-123" \
  --body '{"fields": {"summary": "Updated title"}}'

# PATCH request (partial update)
npx -y @aashari/mcp-server-atlassian-jira patch \
  --path "/rest/api/3/issue/PROJ-123" \
  --body '{"fields": {"summary": "Updated title"}}'

# DELETE request
npx -y @aashari/mcp-server-atlassian-jira delete \
  --path "/rest/api/3/issue/PROJ-123/comment/12345"
```

**Note:** All CLI commands support:
- `--output-format` - Choose between `toon` (default, token-efficient) or `json`
- `--jq` - Filter response with JMESPath expressions
- `--query-params` - Pass query parameters as JSON string

## Troubleshooting

### "Authentication failed" or "403 Forbidden"

1. **Check your API Token permissions**:
   - Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Make sure your token is still active and hasn't expired

2. **Verify your site name format**:
   - If your Jira URL is `https://mycompany.atlassian.net`
   - Your site name should be just `mycompany`

3. **Test your credentials**:
   ```bash
   npx -y @aashari/mcp-server-atlassian-jira get --path "/rest/api/3/myself"
   ```

### "Resource not found" or "404"

1. **Check the API path**:
   - Paths are case-sensitive
   - Use project keys (e.g., `DEV`) not project names
   - Issue keys include the project prefix (e.g., `DEV-123`)

2. **Verify access permissions**:
   - Make sure you have access to the project in your browser
   - Some projects may be restricted to certain users

### "No results found" when searching

1. **Try different search terms**:
   - Use project keys instead of project names
   - Try broader search criteria

2. **Check JQL syntax**:
   - Validate your JQL in Jira's advanced search first

### Claude Desktop Integration Issues

1. **Restart Claude Desktop** after updating the config file
2. **Verify config file location**:
   - macOS: `~/.claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Getting Help

If you're still having issues:
1. Run a simple test command to verify everything works
2. Check the [GitHub Issues](https://github.com/aashari/mcp-server-atlassian-jira/issues) for similar problems
3. Create a new issue with your error message and setup details

## Frequently Asked Questions

### What permissions do I need?

Your Atlassian account needs:
- **Access to Jira** with the appropriate permissions for the projects you want to query
- **API token** with appropriate permissions (automatically granted when you create one)

### Can I use this with Jira Server (on-premise)?

Currently, this tool only supports **Jira Cloud**. Jira Server/Data Center support may be added in future versions.

### How do I find my site name?

Your site name is the first part of your Jira URL:
- URL: `https://mycompany.atlassian.net` -> Site name: `mycompany`
- URL: `https://acme-corp.atlassian.net` -> Site name: `acme-corp`

### What AI assistants does this work with?

Any AI assistant that supports the Model Context Protocol (MCP):
- Claude Desktop
- Cursor AI
- Continue.dev
- Many others

### Is my data secure?

Yes! This tool:
- Runs entirely on your local machine
- Uses your own Jira credentials
- Never sends your data to third parties
- Only accesses what you give it permission to access

### Can I search across multiple projects?

Yes! Use JQL queries for cross-project searches. For example:
```bash
npx -y @aashari/mcp-server-atlassian-jira get \
  --path "/rest/api/3/search/jql" \
  --query-params '{"jql": "assignee=currentUser() AND status=\"In Progress\""}'
```

## Technical Details

### Recent Updates

**Version 3.2.1** (December 2025):
- Added TOON output format for 30-60% token reduction
- Implemented automatic response truncation for large payloads (>40k chars)
- Raw API responses saved to `/tmp/mcp/mcp-server-atlassian-jira/` for reference
- Updated to MCP SDK v1.23.0 with modern `registerTool` API
- Fixed deprecated `/rest/api/3/search` endpoint (now use `/rest/api/3/search/jql`)
- Updated all dependencies to latest versions (Zod v4.1.13, Commander v14.0.2)

### Requirements

- **Node.js**: 18.0.0 or higher
- **MCP SDK**: v1.23.0 (uses modern registration APIs)
- **Jira**: Cloud only (Server/Data Center not supported)

### Architecture

This server follows the 5-layer MCP architecture:
1. **CLI Layer** - Human interface using Commander.js
2. **Tools Layer** - AI interface with Zod validation
3. **Controllers Layer** - Business logic and orchestration
4. **Services Layer** - Direct Jira REST API calls
5. **Utils Layer** - Cross-cutting concerns (logging, formatting, transport)

### Debugging

Enable debug logging by setting the `DEBUG` environment variable:

```bash
# In Claude Desktop config
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@aashari/mcp-server-atlassian-jira"],
      "env": {
        "DEBUG": "true",
        "ATLASSIAN_SITE_NAME": "your-company",
        "ATLASSIAN_USER_EMAIL": "your.email@company.com",
        "ATLASSIAN_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

Debug logs are written to `~/.mcp/data/mcp-server-atlassian-jira.<session-id>.log`

**Check raw API responses:** When responses are truncated, the full raw response is saved to `/tmp/mcp/mcp-server-atlassian-jira/<timestamp>-<random>.txt` with request/response details.

## Migration from v2.x

Version 3.0 replaces 8+ specific tools with 5 generic HTTP method tools. If you're upgrading from v2.x:

**Before (v2.x):**
```
jira_ls_projects, jira_get_project, jira_ls_issues, jira_get_issue,
jira_create_issue, jira_ls_comments, jira_add_comment, jira_ls_statuses, ...
```

**After (v3.0+):**
```
jira_get, jira_post, jira_put, jira_patch, jira_delete
```

**Migration examples:**
- `jira_ls_projects` -> `jira_get` with path `/rest/api/3/project/search`
- `jira_get_project` -> `jira_get` with path `/rest/api/3/project/{key}`
- `jira_get_issue` -> `jira_get` with path `/rest/api/3/issue/{key}`
- `jira_create_issue` -> `jira_post` with path `/rest/api/3/issue`
- `jira_add_comment` -> `jira_post` with path `/rest/api/3/issue/{key}/comment`
- `jira_ls_statuses` -> `jira_get` with path `/rest/api/3/status`

**Benefits of v3.0+:**
- Full access to any Jira REST API v3 endpoint (not just predefined tools)
- JMESPath filtering for efficient data extraction
- Consistent interface across all HTTP methods
- TOON format for 30-60% token savings
- Automatic response truncation with raw file logging

## Support

Need help? Here's how to get assistance:

1. **Check the troubleshooting section above** - most common issues are covered there
2. **Visit our GitHub repository** for documentation and examples: [github.com/aashari/mcp-server-atlassian-jira](https://github.com/aashari/mcp-server-atlassian-jira)
3. **Report issues** at [GitHub Issues](https://github.com/aashari/mcp-server-atlassian-jira/issues)
4. **Start a discussion** for feature requests or general questions

---

*Made with care for teams who want to bring AI into their project management workflow.*
