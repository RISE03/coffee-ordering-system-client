/**
 * SSE（Server-Sent Events）连接封装
 * 负责与后端建立 SSE 长连接，接收实时推送通知
 */

type SseEventHandler = (data: any) => void

interface SseEventHandlers {
  [eventName: string]: SseEventHandler[]
}

/** SSE 连接状态 */
type SseConnectionState = 'disconnected' | 'connecting' | 'connected'

/** 重连间隔（毫秒） */
const RECONNECT_DELAY = 3000
/** 最大重连次数 */
const MAX_RECONNECT_ATTEMPTS = 10

let eventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
let connectionState: SseConnectionState = 'disconnected'

const handlers: SseEventHandlers = {}

/**
 * 注册 SSE 事件监听器
 * @param eventName 事件名称（如 'pickup-notify'、'order-status-change'）
 * @param handler 事件处理函数
 * @returns 取消注册的函数
 */
export function onSseEvent(eventName: string, handler: SseEventHandler): () => void {
  if (!handlers[eventName]) {
    handlers[eventName] = []
  }
  handlers[eventName].push(handler)

  // 如果已有连接，立即注册到 EventSource
  if (eventSource) {
    eventSource.addEventListener(eventName, createEventListener(eventName))
  }

  // 返回取消注册函数
  return () => {
    const list = handlers[eventName]
    if (list) {
      const index = list.indexOf(handler)
      if (index !== -1) {
        list.splice(index, 1)
      }
    }
  }
}

/**
 * 建立 SSE 连接
 * @param token JWT token
 */
export function connectSse(token: string): void {
  if (connectionState === 'connected' || connectionState === 'connecting') {
    console.log('[SSE] 已有连接，跳过')
    return
  }

  connectionState = 'connecting'
  reconnectAttempts = 0

  doConnect(token)
}

/**
 * 断开 SSE 连接
 */
export function disconnectSse(): void {
  connectionState = 'disconnected'
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS // 阻止自动重连

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  console.log('[SSE] 连接已断开')
}

/**
 * 获取当前 SSE 连接状态
 */
export function getSseState(): SseConnectionState {
  return connectionState
}

// -- 内部实现 --

function doConnect(token: string): void {
  // 构建连接 URL，token 通过 URL 参数传递（EventSource 不支持自定义 Header）
  const url = `/api/member/sse/connect?token=${encodeURIComponent(token)}`

  try {
    eventSource = new EventSource(url)
  } catch (e) {
    console.error('[SSE] 创建 EventSource 失败:', e)
    connectionState = 'disconnected'
    return
  }

  // 连接成功
  eventSource.addEventListener('connected', () => {
    console.log('[SSE] 连接已建立')
    connectionState = 'connected'
    reconnectAttempts = 0
  })

  // 注册已有的事件监听器
  for (const eventName of Object.keys(handlers)) {
    eventSource.addEventListener(eventName, createEventListener(eventName))
  }

  // 连接错误处理（包括断线）
  eventSource.onerror = () => {
    console.warn('[SSE] 连接异常')

    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    connectionState = 'disconnected'

    // 自动重连
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      console.log(`[SSE] ${RECONNECT_DELAY / 1000}s 后尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        doConnect(token)
      }, RECONNECT_DELAY)
    } else {
      console.warn('[SSE] 已达最大重连次数，停止重连')
    }
  }
}

function createEventListener(eventName: string) {
  return (event: MessageEvent) => {
    let data: any
    try {
      data = JSON.parse(event.data)
    } catch {
      data = event.data
    }

    const eventHandlers = handlers[eventName]
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data)
        } catch (e) {
          console.error(`[SSE] 事件处理器异常: event=${eventName}`, e)
        }
      }
    }
  }
}
