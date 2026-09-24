import type { ContentBlock, EmbeddedResource, ResourceLink } from '@modelcontextprotocol/sdk/types.js'
import { useHostBridge, type DisplayMode, type HostCapabilities } from './host-bridge'

const DISPLAY_MODE_TIMEOUT_MS = 10_000
// The host asks the user to confirm a download before it answers.
const DOWNLOAD_TIMEOUT_MS = 120_000
const METHOD_NOT_FOUND = -32601

/** A file for `downloadFile` – the host derives the suggested filename from the last URI segment. */
export type DownloadFileContent = EmbeddedResource | ResourceLink

/**
 * Rejection of a host request: `code` and `data` come from the host's JSON-RPC
 * error (-32601 when the host lacks the capability), `cancelled` marks a
 * download the user declined or the host denied.
 */
export interface McpAppRequestError extends Error {
  code?: number
  data?: unknown
  cancelled?: boolean
}

export interface UseHostRequestsReturn {
  /**
   * Ask the host to switch display mode and resolve with the mode it actually
   * set. Resolves with the current mode, without asking, when the host does not
   * offer the requested one.
   */
  requestDisplayMode: (mode: DisplayMode) => Promise<DisplayMode>
  /** Replace the context this view contributes to the model's next turn. */
  updateModelContext: (params: { content?: ContentBlock[], structuredContent?: Record<string, unknown> }) => Promise<void>
  /** Ask the host to download files. */
  downloadFile: (contents: DownloadFileContent[]) => Promise<void>
}

/**
 * View → host requests beyond messages, links and tool calls. Internal building
 * block behind {@link useMcpApp}; exported for tests only.
 * @internal
 */
export function useHostRequests(): UseHostRequestsReturn {
  const bridge = useHostBridge()

  const ensureReady = async (method: string, capability?: keyof HostCapabilities): Promise<void> => {
    await bridge.whenReady()
    if (!bridge.initialized.value) {
      throw new Error(`useMcpApp: cannot send "${method}", the ui/initialize handshake did not complete.`)
    }
    if (capability && !bridge.hostCapabilities.value?.[capability]) {
      throw Object.assign(new Error(`useMcpApp: the host does not support "${method}".`), { code: METHOD_NOT_FOUND })
    }
  }

  const requestDisplayMode = async (mode: DisplayMode): Promise<DisplayMode> => {
    if (!bridge.openai?.requestDisplayMode) await ensureReady('ui/request-display-mode')
    const context = bridge.hostContext.value
    const current = context?.displayMode ?? 'inline'
    if (context?.availableDisplayModes && !context.availableDisplayModes.includes(mode)) return current

    const result = bridge.openai?.requestDisplayMode
      ? await bridge.openai.requestDisplayMode({ mode })
      : await bridge.request<{ mode?: DisplayMode } | null>('ui/request-display-mode', { mode }, DISPLAY_MODE_TIMEOUT_MS)
    const actual = result?.mode ?? current
    bridge.hostContext.value = { ...bridge.hostContext.value, displayMode: actual }
    return actual
  }

  const updateModelContext: UseHostRequestsReturn['updateModelContext'] = async (params) => {
    await ensureReady('ui/update-model-context', 'updateModelContext')
    // Claude has rejected params without `content`.
    await bridge.request('ui/update-model-context', { content: [], ...params })
  }

  const downloadFile = async (contents: DownloadFileContent[]): Promise<void> => {
    await ensureReady('ui/download-file', 'downloadFile')
    const result = await bridge.request<{ isError?: boolean } | null>('ui/download-file', { contents }, DOWNLOAD_TIMEOUT_MS)
    if (result?.isError) {
      throw Object.assign(new Error('useMcpApp: the download was cancelled or denied.'), { cancelled: true })
    }
  }

  return { requestDisplayMode, updateModelContext, downloadFile }
}
