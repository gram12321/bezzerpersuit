# GitHub MCP Configuration Setup

## Instructions

Replace the entire contents of `.agent/rules/mcp.json` with the following:

```json
{
  "mcpServers": {
    "github": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_11AIDVTJQ0JDzH1ppowkoP_FtTimbV6BqryUPjKIFg65qiiEfBGHIaXwrF66Q4TLGEWX2AHAGvTE8oOio",
        "GITHUB_OWNER": "gram12321",
        "GITHUB_REPO": "bezzerpersuit"
      }
    }
  }
}
```

## What This Configuration Does

- **Removes**: Redundant Supabase MCP servers (supabase-dev, supabase-vercel)
- **Adds**: GitHub MCP server configured specifically for the `gram12321/bezzerpersuit` repository
- **Enables**: AI to perform Git operations via MCP tools instead of terminal commands

## After Setup

1. Save the changes to `.agent/rules/mcp.json`
2. **Restart Antigravity** to load the new MCP configuration
3. Verify the connection is working

## Available MCP GitHub Operations

Once configured, the AI can:
- Create, update, and list issues
- Manage pull requests
- Search repositories
- View file contents
- List branches and commits
- And more...

## Security Note

⚠️ **Important**: This configuration includes your GitHub Personal Access Token. 
- The file is gitignored for security
- Remember to revoke and replace this token at https://github.com/settings/tokens
- Never commit this file to source control

## Troubleshooting

If MCP doesn't connect after restart:
1. Check that the token is still valid
2. Verify the command path works: `npx -y @modelcontextprotocol/server-github`
3. Check Antigravity logs for MCP connection errors
