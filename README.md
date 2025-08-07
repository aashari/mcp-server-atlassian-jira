# Atlassian Jira MCP Server

A Node.js/TypeScript Model Context Protocol (MCP) server for Atlassian Jira Cloud. Enables AI systems (e.g., LLMs like Claude or Cursor AI) to securely interact with your Jira projects, issues, comments, and related development information in real time.

[![smithery badge](https://smithery.ai/badge/@aashari/mcp-server-atlassian-jira)](https://smithery.ai/server/@aashari/mcp-server-atlassian-jira)
[![NPM Version](https://img.shields.io/npm/v/@aashari/mcp-server-atlassian-jira)](https://www.npmjs.com/package/@aashari/mcp-server-atlassian-jira)
[![Build Status](https://img.shields.io/github/workflow/status/aashari/mcp-server-atlassian-jira/CI)](https://github.com/aashari/mcp-server-atlassian-jira/actions)

## Why Use This Server?

- **Minimal Input, Maximum Output**: Simple identifiers provide comprehensive details without requiring extra flags.
- **Complete Jira Context**: Access projects, issues, comments, and metadata to understand your work context.
- **Rich Development Information**: Get insights into branches, commits, and pull requests linked to issues.
- **Secure Local Authentication**: Run locally with your credentials, never storing tokens on remote servers.
- **Intuitive Markdown Responses**: Well-structured, consistent Markdown formatting for all outputs.

## What is MCP?

Model Context Protocol (MCP) is an open standard for securely connecting AI systems to external tools and data sources. This server implements MCP for Jira Cloud, enabling AI assistants to interact with your Jira instance programmatically.

## Prerequisites

- **Node.js** (>=18.x): [Download](https://nodejs.org/)
- **Atlassian Account** with access to Jira Cloud

## Setup

### Step 1: Get Your Atlassian API Token

1. Go to your Atlassian API token management page: [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**.
3. Give it a descriptive **Label** (e.g., `mcp-jira-access`).
4. Click **Create**.
5. **Copy the generated API token** immediately. You won't be able to see it again.

### Step 2: Configure Credentials

#### Option A: MCP Config File (Recommended)

Edit or create `~/.mcp/configs.json`:

```json
{
	"jira": {
		"environments": {
			"ATLASSIAN_SITE_NAME": "<YOUR_SITE_NAME>",
			"ATLASSIAN_USER_EMAIL": "<YOUR_ATLASSIAN_EMAIL>",
			"ATLASSIAN_API_TOKEN": "<YOUR_COPIED_API_TOKEN>"
		}
	}
}
```

- `<YOUR_SITE_NAME>`: Your Jira site name (e.g., `mycompany` for `mycompany.atlassian.net`).
- `<YOUR_ATLASSIAN_EMAIL>`: Your Atlassian account email.
- `<YOUR_COPIED_API_TOKEN>`: The API token from Step 1.

#### Option B: Environment Variables

```bash
export ATLASSIAN_SITE_NAME="<YOUR_SITE_NAME>"
export ATLASSIAN_USER_EMAIL="<YOUR_EMAIL>"
export ATLASSIAN_API_TOKEN="<YOUR_API_TOKEN>"
```

### Step 3: Install and Run

#### Quick Start with `npx`

```bash
npx -y @aashari/mcp-server-atlassian-jira ls-projects
```

#### Global Installation

```bash
npm install -g @aashari/mcp-server-atlassian-jira
mcp-atlassian-jira ls-projects
```

### Installing via Smithery

To install Atlassian Jira MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@aashari/mcp-server-atlassian-jira):

```bash
npx -y @smithery/cli install @aashari/mcp-server-atlassian-jira --client claude
```

### Step 4: Connect to AI Assistant

Configure your MCP-compatible client (e.g., Claude, Cursor AI):

```json
{
	"mcpServers": {
		"jira": {
			"command": "npx",
			"args": ["-y", "@aashari/mcp-server-atlassian-jira"]
		}
	}
}
```

## MCP Tools

MCP tools use `snake_case` names, `camelCase` parameters, and return Markdown-formatted responses.

- **jira_ls_projects**: Lists accessible Jira projects (`name`: str opt, `limit`: num opt, `startAt`: num opt, `orderBy`: str opt). Use: View available projects.
- **jira_get_project**: Gets detailed project information (`projectKeyOrId`: str req). Use: Access project components and metadata.
- **jira_ls_issues**: Searches for Jira issues (`jql`: str opt, `projectKeyOrId`: str opt, `statuses`: str[] opt, `orderBy`: str opt, `limit`: num opt, `startAt`: num opt). Use: Find issues matching criteria.
- **jira_get_issue**: Gets comprehensive issue details (`issueIdOrKey`: str req). Use: View issue with comments and development info.
- **jira_ls_comments**: Lists comments for an issue (`issueIdOrKey`: str req, `limit`: num opt, `startAt`: num opt, `orderBy`: str opt). Use: Read issue discussion.
- **jira_add_comment**: Adds comment to an issue (`issueIdOrKey`: str req, `commentBody`: str req). Use: Add feedback to issues.
- **jira_ls_statuses**: Lists available workflow statuses (`projectKeyOrId`: str opt). Use: Check valid status transitions.

<details>
<summary><b>MCP Tool Examples (Click to expand)</b></summary>

### `jira_ls_projects`

**Basic List Projects:**
```json
{}
```

**Filtered Projects:**
```json
{
	"name": "Platform",
	"limit": 10,
	"orderBy": "name"
}
```

### `jira_get_project`

**Get Project by Key:**
```json
{ "projectKeyOrId": "DEV" }
```

**Get Project by ID:**
```json
{ "projectKeyOrId": "10001" }
```

### `jira_ls_issues`

**Search with JQL:**
```json
{ "jql": "project = DEV AND status = 'In Progress'" }
```

**Filter by Project and Status:**
```json
{
	"projectKeyOrId": "DEV",
	"statuses": ["In Progress", "To Do"],
	"limit": 15
}
```

### `jira_get_issue`

**Get Issue Details:**
```json
{ "issueIdOrKey": "PROJ-123" }
```

### `jira_ls_comments`

**List Comments:**
```json
{ "issueIdOrKey": "PROJ-123" }
```

**Sorted Comments:**
```json
{
	"issueIdOrKey": "PROJ-123",
	"limit": 10,
	"orderBy": "created DESC"
}
```

### `jira_add_comment`

**Add Comment:**
```json
{
	"issueIdOrKey": "PROJ-123",
	"commentBody": "Thanks for the update. I'll review this by end of day."
}
```

### `jira_ls_statuses`

**List All Statuses:**
```json
{}
```

**Project-Specific Statuses:**
```json
{ "projectKeyOrId": "DEV" }
```

</details>

## Transport Modes

This server supports two transport modes for different integration scenarios:

### STDIO Transport (Default for MCP Clients)
- Traditional subprocess communication via stdin/stdout
- Ideal for local AI assistant integrations (Claude Desktop, Cursor AI)
- Uses pipe-based communication for direct MCP protocol exchange

```bash
# Run with STDIO transport (default for AI assistants)
TRANSPORT_MODE=stdio npx @aashari/mcp-server-atlassian-jira

# Using npm scripts (after installation)
npm run mcp:stdio
```

### HTTP Transport (Default for Server Mode)
- Modern HTTP-based transport with Server-Sent Events (SSE)
- Supports multiple concurrent connections
- Better for web-based integrations and development
- Runs on port 3000 by default (configurable via PORT env var)
- Endpoint: http://localhost:3000/mcp
- Health check: http://localhost:3000/

```bash
# Run with HTTP transport (default when no CLI args)
TRANSPORT_MODE=http npx @aashari/mcp-server-atlassian-jira

# Using npm scripts (after installation)
npm run mcp:http

# Test with MCP Inspector
npm run mcp:inspect
```

### Environment Variables

**Transport Configuration:**
- `TRANSPORT_MODE`: Set to `stdio` or `http` (default: `http` for server mode, `stdio` for MCP clients)
- `PORT`: HTTP server port (default: 3000)
- `DEBUG`: Enable debug logging (default: false)

**Authentication:**
- `ATLASSIAN_JIRA_URL`: Your Jira instance URL
- `ATLASSIAN_USER_EMAIL`: Your Atlassian account email
- `ATLASSIAN_API_TOKEN`: Your Atlassian API token

## CLI Commands

CLI commands use `kebab-case`. Run `--help` for details (e.g., `mcp-atlassian-jira ls-projects --help`).

- **ls-projects**: Lists Jira projects (`--name`, `--limit`, `--start-at`, `--order-by`). Ex: `mcp-atlassian-jira ls-projects`.
- **get-project**: Gets project details (`--project-key-or-id`). Ex: `mcp-atlassian-jira get-project --project-key-or-id DEV`.
- **ls-issues**: Searches for issues (`--jql`, `--project-key-or-id`, `--statuses`, `--order-by`, `--limit`, `--start-at`). Ex: `mcp-atlassian-jira ls-issues --project-key-or-id DEV`.
- **get-issue**: Gets issue details (`--issue-id-or-key`). Ex: `mcp-atlassian-jira get-issue --issue-id-or-key PROJ-123`.
- **ls-comments**: Lists comments (`--issue-id-or-key`, `--limit`, `--start-at`, `--order-by`). Ex: `mcp-atlassian-jira ls-comments --issue-id-or-key PROJ-123`.
- **add-comment**: Adds comment (`--issue-id-or-key`, `--body`). Ex: `mcp-atlassian-jira add-comment --issue-id-or-key PROJ-123 --body "Comment text"`.
- **ls-statuses**: Lists statuses (`--project-key-or-id`). Ex: `mcp-atlassian-jira ls-statuses`.

<details>
<summary><b>CLI Command Examples (Click to expand)</b></summary>

### List Projects

**Basic List:**
```bash
mcp-atlassian-jira ls-projects
```

**Filtered List:**
```bash
mcp-atlassian-jira ls-projects --name "Platform" --limit 10 --order-by "name"
```

### Get Project

```bash
mcp-atlassian-jira get-project --project-key-or-id DEV
```

### List Issues

**With JQL:**
```bash
mcp-atlassian-jira ls-issues --jql "project = DEV AND status = 'In Progress'"
```

**With Filters:**
```bash
mcp-atlassian-jira ls-issues --project-key-or-id DEV --statuses "In Progress" "To Do" --limit 15
```

### Get Issue

```bash
mcp-atlassian-jira get-issue --issue-id-or-key PROJ-123
```

### List Comments

```bash
mcp-atlassian-jira ls-comments --issue-id-or-key PROJ-123 --order-by "created DESC"
```

### Add Comment

```bash
mcp-atlassian-jira add-comment --issue-id-or-key PROJ-123 --body "This issue has been prioritized for the next sprint."
```

### List Statuses

```bash
mcp-atlassian-jira ls-statuses --project-key-or-id DEV
```

</details>

## Response Format

All responses are Markdown-formatted, including:

- **Title**: Tool name and action performed.
- **Content**: Structured data with headers, tables, and code blocks.
- **Pagination**: Information about total results and navigation to additional pages.
- **Links**: References to related resources when applicable.

<details>
<summary><b>Response Format Examples (Click to expand)</b></summary>

### Project List Response

```markdown
# Jira Projects

Showing **4** projects matching "Platform" out of 15 total projects.

| Key | Name | Lead | Issues |
|---|---|---|---|
| [PLAT](#) | Platform Services | Maria Johnson | 204 issues |
| [PLTX](#) | Platform Extensions | Chris Smith | 156 issues |
| [PAPI](#) | Platform API | Dev Team | 87 issues |
| [PINT](#) | Platform Integrations | Alex Wong | 42 issues |

*Retrieved from mycompany.atlassian.net on 2025-05-19 14:22 UTC*
```

### Issue Details Response

```markdown
# Issue: PROJ-123

**[PROJ-123](https://mycompany.atlassian.net/browse/PROJ-123): Implement OAuth2 authentication flow**

**Project:** [PROJ](#) (Project Name)
**Type:** 🛠️ Task
**Status:** 🟡 In Progress
**Priority:** 🔼 High
**Assignee:** Jane Doe
**Reporter:** John Smith
**Created:** 2025-05-01
**Updated:** 2025-05-18

## Description

We need to implement the OAuth2 authentication flow with the following requirements:

- Support authorization code flow
- Implement PKCE extension
- Store refresh tokens securely
- Add automatic token refresh

## Comments (3)

### John Smith - 2025-05-01
Initial requirements attached. See the authentication flow diagram.

### Jane Doe - 2025-05-15
I've started implementation. Questions about token expiration and storage.

### Project Lead - 2025-05-18
Looks good so far. Please add unit tests for token refresh logic.

## Development Information

**Branch:** feature/oauth2-auth
**Commits:** 7 commits by Jane Doe
**Pull Request:** [PR-45](https://github.com/mycompany/project/pull/45) (Open)

*Retrieved on 2025-05-19 14:25 UTC*
```

</details>

## Development

```bash
# Clone repository
git clone https://github.com/aashari/mcp-server-atlassian-jira.git
cd mcp-server-atlassian-jira

# Install dependencies
npm install

# Run in development mode
npm run dev:server

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/xyz`).
3. Commit changes (`git commit -m "Add xyz feature"`).
4. Push to the branch (`git push origin feature/xyz`).
5. Open a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[ISC License](LICENSE)
