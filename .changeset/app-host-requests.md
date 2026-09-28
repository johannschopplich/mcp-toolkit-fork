---
"@nuxtjs/mcp-toolkit": minor
---

`useMcpApp()` covers display mode, model context and file downloads:

- `hostCapabilities` holds the capabilities the host announced in `ui/initialize`, so an app can check for a feature before offering it.
- `hostContext` follows `ui/notifications/host-context-changed` and merges partial updates. Before, `theme` and `displayMode` kept their handshake values.
- `requestDisplayMode(mode)` asks the host for `inline`, `fullscreen` or `pip` and resolves with the mode it set (through `window.openai.requestDisplayMode` in ChatGPT).
- `updateModelContext({ content, structuredContent })` replaces the context the app contributes to the model's next turn.
- `downloadFile(contents)` saves embedded or linked MCP resources through the host and rejects with `cancelled: true` when the user cancels. Linked files must use `http` or `https`.

`useToolCall` is now exported from `@nuxtjs/mcp-toolkit/app` to call a tool without replacing `data`. Tool calls wait for the `ui/initialize` handshake, so calling a tool on mount no longer races it. A JSON-RPC error from the host keeps its `code` and `data` — on the rejection of the new methods, and on `error` of `useToolCall` and `useMcpApp` after a failed tool call. The new types `DisplayMode`, `HostCapabilities`, `DownloadFileContent` and `McpAppRequestError` are exported.
