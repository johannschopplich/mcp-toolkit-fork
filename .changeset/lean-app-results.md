---
"@nuxtjs/mcp-toolkit": patch
---

Stop embedding the view HTML in MCP App tool results. Hosts load the view from the `ui://` resource, so the embedded copy only reached the model's context and pushed results past token limits such as Claude Code's 25k. `initialData` now holds the first payload the view receives.
