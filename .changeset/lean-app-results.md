---
"@nuxtjs/mcp-toolkit": minor
---

Stop embedding the view HTML in MCP App tool results. Hosts load the view from the `ui://` resource, so the embedded copy only reached the model's context. `data` is now `null` until the host pushes the tool result, and `initialData` holds the first payload the view receives.
