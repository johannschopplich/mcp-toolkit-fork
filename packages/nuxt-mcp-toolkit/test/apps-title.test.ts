import { describe, it, expect } from 'vitest'
import { defineMcpApp, _createAppTool } from '../src/runtime/server/mcp/definitions/apps'
import { enrichNameTitle } from '../src/runtime/server/mcp/definitions/utils'

const ctx = { name: 'create-final-icon', html: '<!DOCTYPE html><html><head></head><body></body></html>' }

/** Resolve name and title the way registration does, after the loader injects the generated file's name. */
function register(tool: ReturnType<typeof _createAppTool>) {
  return enrichNameTitle({
    name: tool.name,
    title: tool.title,
    _meta: { ...tool._meta, filename: `${ctx.name}.tool.mjs` },
    type: 'tool',
  })
}

describe('MCP App — tool title', () => {
  it('derives the title from the SFC name, not the generated `.tool.mjs` file', () => {
    expect(register(_createAppTool(defineMcpApp(), ctx))).toEqual({
      name: 'create-final-icon',
      title: 'Create Final Icon',
    })
  })

  it('keeps an explicit title', () => {
    expect(register(_createAppTool(defineMcpApp({ title: 'Final icon' }), ctx)).title).toBe('Final icon')
  })
})
