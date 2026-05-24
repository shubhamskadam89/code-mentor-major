// WebSocket Service for CodeMentor - Placeholder for real-time features

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface CodeUpdate {
  code: string
  language: string
  problemId: string
  userId: string
}

export interface HintUpdate {
  hintId: number
  problemId: string
  userId: string
  action: 'viewed' | 'used' | 'dismissed'
}

export interface ProgressUpdate {
  problemId: string
  userId: string
  attempts: number
  solved: boolean
  timeSpent: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private messageHandlers: Map<string, Function[]> = new Map()

  constructor() {
    this.connect()
  }

  private connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true

    try {
      // TODO: Replace with actual WebSocket endpoint
      const wsUrl = 'ws://localhost:3001/ws'

      console.log('Connecting to WebSocket:', wsUrl)

      // For now, simulate WebSocket connection
      this.simulateConnection()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.handleConnectionError()
    }
  }

  private simulateConnection(): void {
    // Simulate successful connection
    setTimeout(() => {
      this.isConnecting = false
      console.log('WebSocket connection simulated (not actually connected)')
      
      // Simulate receiving some messages
      this.simulateMessages()
    }, 1000)
  }

  private simulateMessages(): void {
    // Simulate receiving real-time updates
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of receiving a message
        const messageTypes = ['hint_update', 'progress_update', 'code_analysis']
        const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
        
        this.handleMessage({
          type: randomType,
          data: this.getMockMessageData(randomType),
          timestamp: Date.now()
        })
      }
    }, 10000) // Check every 10 seconds
  }

  private getMockMessageData(type: string): any {
    switch (type) {
      case 'hint_update':
        return {
          hintId: Math.floor(Math.random() * 10) + 1,
          problemId: 'leetcode_two_sum',
          userId: 'user-123',
          action: 'viewed'
        }
      case 'progress_update':
        return {
          problemId: 'leetcode_add_two_numbers',
          userId: 'user-123',
          attempts: Math.floor(Math.random() * 5) + 1,
          solved: Math.random() > 0.5,
          timeSpent: Math.floor(Math.random() * 3600000) + 300000
        }
      case 'code_analysis':
        return {
          problemId: 'leetcode_longest_substring',
          userId: 'user-123',
          score: Math.floor(Math.random() * 40) + 60,
          complexity: Math.random() > 0.5 ? 'O(n)' : 'O(n²)'
        }
      default:
        return {}
    }
  }

  private handleConnectionError(): void {
    this.isConnecting = false
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)
      
      // Exponential backoff
      this.reconnectDelay *= 2
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message)
    
    const handlers = this.messageHandlers.get(message.type) || []
    handlers.forEach(handler => {
      try {
        handler(message.data)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  // Public methods
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  public send(message: WebSocketMessage): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  public subscribe(messageType: string, handler: Function): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, [])
    }
    this.messageHandlers.get(messageType)!.push(handler)
  }

  public unsubscribe(messageType: string, handler: Function): void {
    const handlers = this.messageHandlers.get(messageType) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000
  }

  // Specific message types
  public sendCodeUpdate(code: string, language: string, problemId: string, userId: string): void {
    this.send({
      type: 'code_update',
      data: { code, language, problemId, userId },
      timestamp: Date.now()
    })
  }

  public sendHintUpdate(hintId: number, problemId: string, userId: string, action: string): void {
    this.send({
      type: 'hint_update',
      data: { hintId, problemId, userId, action },
      timestamp: Date.now()
    })
  }

  public sendProgressUpdate(problemId: string, userId: string, attempts: number, solved: boolean, timeSpent: number): void {
    this.send({
      type: 'progress_update',
      data: { problemId, userId, attempts, solved, timeSpent },
      timestamp: Date.now()
    })
  }

  // Event listeners for specific message types
  public onHintUpdate(handler: (data: HintUpdate) => void): void {
    this.subscribe('hint_update', handler)
  }

  public onProgressUpdate(handler: (data: ProgressUpdate) => void): void {
    this.subscribe('progress_update', handler)
  }

  public onCodeAnalysis(handler: (data: any) => void): void {
    this.subscribe('code_analysis', handler)
  }

  public onConnectionStatus(handler: (connected: boolean) => void): void {
    // Simulate connection status changes
    setInterval(() => {
      handler(this.isConnected())
    }, 5000)
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()
