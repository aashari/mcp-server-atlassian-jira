[![MSeeP.ai Security Assessment Badge](https://mseep.net/pr/aashari-mcp-server-atlassian-jira-badge.png)](https://mseep.ai/app/aashari-mcp-server-atlassian-jira)

# Connect AI to Your Jira Projects

Transform how you manage and track your work by connecting Claude, Cursor AI, and other AI assistants directly to your Jira projects, issues, and workflows. Get instant project insights, streamline issue management, and enhance your team collaboration.

[![NPM Version](https://img.shields.io/npm/v/@aashari/mcp-server-atlassian-jira)](https://www.npmjs.com/package/@aashari/mcp-server-atlassian-jira)

## What You Can Do

✅ **Ask AI about your projects**: *"What are the active issues in the DEV project?"*  
✅ **Get issue insights**: *"Show me details about PROJ-123 including comments"*  
✅ **Track project progress**: *"List all high priority issues assigned to me"*  
✅ **Manage issue comments**: *"Add a comment to PROJ-456 about the test results"*  
✅ **Search across projects**: *"Find all bugs in progress across my projects"*  
✅ **Check workflow status**: *"What are the available statuses for the DEV project?"*  

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
npx -y @aashari/mcp-server-atlassian-jira ls-projects

# Get details about a specific project
npx -y @aashari/mcp-server-atlassian-jira get-project --project-key-or-id DEV

# Search for issues
npx -y @aashari/mcp-server-atlassian-jira ls-issues --project-key-or-id DEV
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

Restart Claude Desktop, and you'll see "🔗 jira" in the status bar.

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

## Real-World Examples

### 📋 Explore Your Projects

Ask your AI assistant:
- *"List all projects I have access to"*
- *"Show me details about the DEV project"*  
- *"What projects contain the word 'Platform'?"*
- *"Get project information for PROJ-123"*

### 🔍 Search and Track Issues

Ask your AI assistant:
- *"Find all high priority issues in the DEV project"*
- *"Show me issues assigned to me that are in progress"*
- *"Search for bugs reported in the last week"*
- *"List all open issues for the mobile team"*

### 📝 Manage Issue Details

Ask your AI assistant:
- *"Get full details about issue PROJ-456 including comments"*
- *"Show me the development information for PROJ-789"*
- *"What's the current status and assignee of PROJ-123?"*
- *"Display all comments on the authentication bug"*

### 💬 Issue Communication

Ask your AI assistant:
- *"Add a comment to PROJ-456: 'Code review completed, ready for testing'"*
- *"Comment on the login issue that it's been deployed to staging"*
- *"Add testing results to issue PROJ-789"*

### 🔄 Workflow Management

Ask your AI assistant:
- *"What are the available statuses in the DEV project?"*
- *"Show me all possible workflow states"*
- *"What status options are available for project MOBILE?"*
- *"List the workflow states for issue transitions"*

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
   # Test your credentials work
   npx -y @aashari/mcp-server-atlassian-jira ls-projects
   ```

### "Project not found" or "Issue not found"

1. **Check project key spelling**:
   ```bash
   # List your projects to see the correct keys
   npx -y @aashari/mcp-server-atlassian-jira ls-projects
   ```

2. **Verify access permissions**:
   - Make sure you have access to the project in your browser
   - Some projects may be restricted to certain users

### "No results found" when searching

1. **Try different search terms**:
   - Use project keys instead of project names
   - Try broader search criteria

2. **Check issue permissions**:
   - You can only access issues you have permission to view
   - Ask your admin if you should have access to specific projects

### Claude Desktop Integration Issues

1. **Restart Claude Desktop** after updating the config file
2. **Check the status bar** for the "🔗 jira" indicator
3. **Verify config file location**:
   - macOS: `~/.claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

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
- URL: `https://mycompany.atlassian.net` → Site name: `mycompany`
- URL: `https://acme-corp.atlassian.net` → Site name: `acme-corp`

### What AI assistants does this work with?

Any AI assistant that supports the Model Context Protocol (MCP):
- Claude Desktop (most popular)
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

Yes! When you don't specify a project, searches will look across all projects you have access to. You can also use JQL queries for advanced cross-project searches.

## Support

Need help? Here's how to get assistance:

1. **Check the troubleshooting section above** - most common issues are covered there
2. **Visit our GitHub repository** for documentation and examples: [github.com/aashari/mcp-server-atlassian-jira](https://github.com/aashari/mcp-server-atlassian-jira)
3. **Report issues** at [GitHub Issues](https://github.com/aashari/mcp-server-atlassian-jira/issues)
4. **Start a discussion** for feature requests or general questions

---

*Made with ❤️ for teams who want to bring AI into their project management workflow.*
