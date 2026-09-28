---
"@nuxtjs/mcp-toolkit": patch
---

On Cloudflare Workers, MCP requests no longer fail with "unsupported server" when `agents` resolves its own copy of `@modelcontextprotocol/sdk`, and the SDK v1 deprecation warning of `agents` is gone. The module now serves requests through `createLegacyMcpHandler` from `agents/mcp`.
