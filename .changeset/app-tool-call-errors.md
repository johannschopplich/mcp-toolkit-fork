---
"@nuxtjs/mcp-toolkit": patch
---

Set `error` in `useToolCall` when the tool result reports `isError`. `useMcpApp().callTool` now sets `loading` to `false` even before the host pushes a tool result, and writes a failed call into `error`.
