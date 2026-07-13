/**
 * WebSocket service for real-time chat functionality.
 * Manages connection, messaging, typing indicators, and notifications.
 */
import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      // Tokens are in httpOnly cookies; omitting the query param keeps the
      // access token out of browser history and proxy logs.
      const wsUrl = `${WS_BASE_URL}/chat/`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        options.onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        options.onDisconnect?.();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000 * reconnectAttemptsRef.current);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.(error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Join a conversation room
  const joinConversation = useCallback((conversationId: number) => {
    send({
      type: 'join_conversation',
      conversation_id: conversationId,
    });
  }, [send]);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: number) => {
    send({
      type: 'leave_conversation',
      conversation_id: conversationId,
    });
  }, [send]);

  // Send a message through WebSocket
  const sendChatMessage = useCallback((conversationId: number, content: string, messageType: string = 'text') => {
    send({
      type: 'send_message',
      conversation_id: conversationId,
      content,
      message_type: messageType,
    });
  }, [send]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: number, isTyping: boolean) => {
    send({
      type: 'typing_indicator',
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }, [send]);

  // Mark messages as read
  const markMessagesRead = useCallback((conversationId: number, messageIds: number[]) => {
    send({
      type: 'mark_read',
      conversation_id: conversationId,
      message_ids: messageIds,
    });
  }, [send]);

  // Update online status
  const updateOnlineStatus = useCallback((isOnline: boolean) => {
    send({
      type: 'online_status',
      is_online: isOnline,
    });
  }, [send]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    joinConversation,
    leaveConversation,
    sendChatMessage,
    sendTypingIndicator,
    markMessagesRead,
    updateOnlineStatus,
    reconnect: connect,
  };
}

// Standalone WebSocket service for non-React contexts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  connect() {
    try {
      // Tokens are sent via httpOnly cookie; do not include them in the URL.
      const wsUrl = `${WS_BASE_URL}/chat/`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 3000 * this.reconnectAttempts);
    }
  }

  private handleMessage(data: WebSocketMessage) {
    const handlers = this.messageHandlers.get(data.type) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }

  // Convenience methods
  joinConversation(conversationId: number) {
    this.send({ type: 'join_conversation', conversation_id: conversationId });
  }

  leaveConversation(conversationId: number) {
    this.send({ type: 'leave_conversation', conversation_id: conversationId });
  }

  sendMessage(conversationId: number, content: string, messageType: string = 'text') {
    this.send({
      type: 'send_message',
      conversation_id: conversationId,
      content,
      message_type: messageType,
    });
  }

  sendTypingIndicator(conversationId: number, isTyping: boolean) {
    this.send({
      type: 'typing_indicator',
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }
}

export const websocketService = new WebSocketService();
