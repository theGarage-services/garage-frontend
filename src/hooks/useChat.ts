/**
 * Custom hook for chat functionality.
 * Provides centralized chat state management and API integration.
 * Includes real-time WebSocket support for messages and typing indicators.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as chatApi from '../api/chat';
import { getUnreadNotificationCount } from '../api/notifications';
import type {
  Conversation,
  Message,
  CoffeeChatRequest,
  ConsiderationRequest,
  ChatNotification,
  ConversationStats,
  CreateMessageRequest,
  CreateCoffeeChatRequest,
  CreateConsiderationRequest,
} from '../api/chat';

/** Build WebSocket URL from current API base */
function getWebSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const parsed = new URL(apiUrl);
  const wsProto = parsed.protocol === 'https:' ? 'wss' : 'ws';
  // Tokens are sent via httpOnly cookie; do not include them in the URL.
  return `${wsProto}://${parsed.host}/ws/chat/`;
}

/** Append a message only if its id is not already present. */
function appendUniqueMessage(prev: Message[], msg: Message): Message[] {
  if (prev.some((m) => m.id === msg.id)) return prev;
  return [...prev, msg];
}

/** Add or remove a typing user from the list. */
function updateTypingUsers(prev: TypingUser[], userId: number, username: string, isTyping: boolean, conversationId: number): TypingUser[] {
  if (!isTyping) {
    return prev.filter((t) => t.userId !== userId);
  }
  if (prev.some((t) => t.userId === userId)) return prev;
  return [...prev, { userId, username, conversationId }];
}

/** Mark specified messages as read. */
function markMessagesRead(prev: Message[], messageIds: number[]): Message[] {
  return prev.map((msg) => (messageIds.includes(msg.id) ? { ...msg, status: 'read' as const } : msg));
}

/** Remove typing indicators for a given conversation. */
function removeTypingForConversation(prev: TypingUser[], conversationId: number): TypingUser[] {
  return prev.filter((t) => t.conversationId !== conversationId);
}

/** Remove a specific typing user by id. */
function removeTypingUser(prev: TypingUser[], userId: number): TypingUser[] {
  return prev.filter((t) => t.userId !== userId);
}

interface TypingUser {
  userId: number;
  username: string;
  conversationId: number;
}

interface UseChatReturn {
  // Conversations
  conversations: Conversation[];
  isLoadingConversations: boolean;
  errorConversations: string | null;
  refreshConversations: () => Promise<void>;

  // Current conversation
  currentConversation: Conversation | null;
  setCurrentConversation: (conv: Conversation | null) => void;
  conversationMessages: Message[];
  isLoadingMessages: boolean;
  loadMessages: (conversationId: number) => Promise<void>;
  sendMessage: (data: CreateMessageRequest) => Promise<void>;
  markAsRead: (conversationId: number) => Promise<void>;

  // Coffee Chat
  coffeeChatRequests: CoffeeChatRequest[];
  receivedCoffeeChats: CoffeeChatRequest[];
  sentCoffeeChats: CoffeeChatRequest[];
  isLoadingCoffeeChats: boolean;
  sendCoffeeChatRequest: (data: CreateCoffeeChatRequest) => Promise<CoffeeChatRequest>;
  acceptCoffeeChat: (id: number, message?: string) => Promise<void>;
  declineCoffeeChat: (id: number, message?: string) => Promise<void>;

  // Considerations
  considerationRequests: ConsiderationRequest[];
  receivedConsiderations: ConsiderationRequest[];
  sentConsiderations: ConsiderationRequest[];
  isLoadingConsiderations: boolean;
  sendConsideration: (data: CreateConsiderationRequest) => Promise<ConsiderationRequest>;
  acceptConsideration: (id: number, message?: string, videoResponseIds?: number[]) => Promise<{ success?: boolean; requires_video_prompts?: boolean; missing_prompt_ids?: number[]; consideration?: ConsiderationRequest; job_application?: { id: number; status: string }; error?: string }>;
  declineConsideration: (id: number, message?: string) => Promise<void>;

  // Notifications
  notifications: ChatNotification[];
  unreadCount: number;
  isLoadingNotifications: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Stats
  stats: ConversationStats | null;
  refreshStats: () => Promise<void>;

  // Init chat
  initChatFromJob: (jobId: number, candidateId?: number) => Promise<Conversation>;
  initChatFromProfile: (userId: number) => Promise<Conversation>;

  // Real-time
  isConnected: boolean;
  typingUsers: TypingUser[];
  sendTypingIndicator: (conversationId: number, isTyping: boolean) => void;
}

export function useChat(): UseChatReturn {
  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  
  // Current conversation state
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Coffee chat state
  const [coffeeChatRequests, setCoffeeChatRequests] = useState<CoffeeChatRequest[]>([]);
  const [receivedCoffeeChats, setReceivedCoffeeChats] = useState<CoffeeChatRequest[]>([]);
  const [sentCoffeeChats, setSentCoffeeChats] = useState<CoffeeChatRequest[]>([]);
  const [isLoadingCoffeeChats, setIsLoadingCoffeeChats] = useState(false);
  
  // Considerations state
  const [considerationRequests, setConsiderationRequests] = useState<ConsiderationRequest[]>([]);
  const [receivedConsiderations, setReceivedConsiderations] = useState<ConsiderationRequest[]>([]);
  const [sentConsiderations, setSentConsiderations] = useState<ConsiderationRequest[]>([]);
  const [isLoadingConsiderations, setIsLoadingConsiderations] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState<ConversationStats | null>(null);

  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Load conversations
  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setErrorConversations(null);
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (err) {
      setErrorConversations(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // WebSocket message handlers
  const handleNewMessage = useCallback((msg: Message) => {
    setConversationMessages((prev) => appendUniqueMessage(prev, msg));
    refreshConversations();
  }, [refreshConversations]);

  const handleTypingIndicator = useCallback((data: any) => {
    const { user_id, username, is_typing } = data;
    const convId = currentConversation?.id ?? 0;
    setTypingUsers((prev) => updateTypingUsers(prev, user_id, username, is_typing, convId));
    if (is_typing) {
      if (typingTimeoutRef.current[user_id]) clearTimeout(typingTimeoutRef.current[user_id]);
      typingTimeoutRef.current[user_id] = setTimeout(() => {
        setTypingUsers((prev) => removeTypingUser(prev, user_id));
      }, 3000);
    }
  }, [currentConversation?.id]);

  const handleReadReceipt = useCallback((messageIds: number[]) => {
    setConversationMessages((prev) => markMessagesRead(prev, messageIds));
  }, []);

  const handleConnectionEstablished = useCallback((ws: WebSocket) => {
    if (currentConversation) {
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversation_id: currentConversation.id,
      }));
    }
  }, [currentConversation]);

  const dispatchWebSocketMessage = useCallback((event: MessageEvent, ws: WebSocket) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'new_message':
          handleNewMessage(data.message as Message);
          break;
        case 'typing_indicator':
          handleTypingIndicator(data);
          break;
        case 'read_receipt':
          handleReadReceipt(data.message_ids);
          break;
        case 'connection_established':
          handleConnectionEstablished(ws);
          break;
      }
    } catch {
      // ignore malformed messages
    }
  }, [handleNewMessage, handleTypingIndicator, handleReadReceipt, handleConnectionEstablished]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Guard against CONNECTING (0) and OPEN (1) states
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      dispatchWebSocketMessage(event, ws);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [dispatchWebSocketMessage]);

  const disconnectWebSocket = useCallback(() => {
    // Cancel any pending reconnect before closing
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      // Remove onclose so intentional close doesn't trigger auto-reconnect
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendTypingIndicator = useCallback((conversationId: number, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing_indicator',
        conversation_id: conversationId,
        is_typing: isTyping,
      }));
    }
  }, []);

  const clearTypingForConversation = useCallback((conversationId: number) => {
    setTypingUsers((prev) => removeTypingForConversation(prev, conversationId));
  }, []);

  // Auto-connect on mount (real auth is in the httpOnly cookie; the
  // sessionStorage flag is only a UX hint, so we always try to connect)
  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  // Join conversation group when currentConversation changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'join_conversation',
        conversation_id: currentConversation.id,
      }));
    }
    return () => {
      if (currentConversation) {
        clearTypingForConversation(currentConversation.id);
      }
    };
  }, [currentConversation?.id]);

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const data = await chatApi.getConversationMessages(conversationId);
      setConversationMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (data: CreateMessageRequest) => {
    try {
      await chatApi.sendMessage(data);
      // Refresh messages
      await loadMessages(data.conversation);
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [loadMessages]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await chatApi.markConversationAsRead(conversationId);
      await refreshConversations();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [refreshConversations]);

  // Load coffee chats
  const refreshCoffeeChats = useCallback(async () => {
    setIsLoadingCoffeeChats(true);
    try {
      const [all, received, sent] = await Promise.all([
        chatApi.getCoffeeChatRequests(),
        chatApi.getReceivedCoffeeChatRequests(),
        chatApi.getSentCoffeeChatRequests(),
      ]);
      setCoffeeChatRequests(all);
      setReceivedCoffeeChats(received);
      setSentCoffeeChats(sent);
    } catch (err) {
      console.error('Failed to load coffee chats:', err);
    } finally {
      setIsLoadingCoffeeChats(false);
    }
  }, []);

  // Send coffee chat request
  const sendCoffeeChatRequest = useCallback(async (data: CreateCoffeeChatRequest) => {
    const result = await chatApi.createCoffeeChatRequest(data);
    await refreshCoffeeChats();
    return result;
  }, [refreshCoffeeChats]);

  // Accept/decline coffee chat
  const acceptCoffeeChat = useCallback(async (id: number, message?: string) => {
    await chatApi.acceptCoffeeChatRequest(id, message);
    await refreshCoffeeChats();
  }, [refreshCoffeeChats]);

  const declineCoffeeChat = useCallback(async (id: number, message?: string) => {
    await chatApi.declineCoffeeChatRequest(id, message);
    await refreshCoffeeChats();
  }, [refreshCoffeeChats]);

  // Load considerations
  const refreshConsiderations = useCallback(async () => {
    setIsLoadingConsiderations(true);
    try {
      const [all, received, sent] = await Promise.all([
        chatApi.getConsiderationRequests(),
        chatApi.getReceivedConsiderations(),
        chatApi.getSentConsiderations(),
      ]);
      setConsiderationRequests(all);
      setReceivedConsiderations(received);
      setSentConsiderations(sent);
    } catch (err) {
      console.error('Failed to load considerations:', err);
    } finally {
      setIsLoadingConsiderations(false);
    }
  }, []);

  // Send consideration
  const sendConsideration = useCallback(async (data: CreateConsiderationRequest) => {
    const result = await chatApi.createConsiderationRequest(data);
    await refreshConsiderations();
    return result;
  }, [refreshConsiderations]);

  // Accept/decline consideration
  const acceptConsideration = useCallback(async (id: number, message?: string, videoResponseIds?: number[]) => {
    const result = await chatApi.acceptConsideration(id, message, videoResponseIds);
    await refreshConsiderations();
    return result;
  }, [refreshConsiderations]);

  const declineConsideration = useCallback(async (id: number, message?: string) => {
    await chatApi.declineConsideration(id, message);
    await refreshConsiderations();
  }, [refreshConsiderations]);

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const [notifs, count] = await Promise.all([
        chatApi.getChatNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count.unread_count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (id: number) => {
    await chatApi.markNotificationAsRead(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    await chatApi.markAllNotificationsAsRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  // Load stats
  const refreshStats = useCallback(async () => {
    try {
      const data = await chatApi.getConversationStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Init chat from job
  const initChatFromJob = useCallback(async (jobId: number, candidateId?: number) => {
    const result = await chatApi.initChatFromJob(jobId, candidateId);
    await refreshConversations();
    return result.conversation;
  }, [refreshConversations]);

  // Init chat from profile
  const initChatFromProfile = useCallback(async (userId: number) => {
    const result = await chatApi.initChatFromProfile(userId);
    await refreshConversations();
    return result.conversation;
  }, [refreshConversations]);

  // Initial load (real auth lives in the cookie, so always attempt to load)
  useEffect(() => {
    refreshConversations();
    refreshCoffeeChats();
    refreshConsiderations();
    refreshNotifications();
    refreshStats();
  }, [refreshConversations, refreshCoffeeChats, refreshConsiderations, refreshNotifications, refreshStats]);

  // Debug logging when chat data changes
  useEffect(() => {
    console.log('[useChat] conversations:', conversations.length, conversations);
  }, [conversations]);
  useEffect(() => {
    console.log('[useChat] receivedCoffeeChats:', receivedCoffeeChats.length, receivedCoffeeChats);
  }, [receivedCoffeeChats]);
  useEffect(() => {
    console.log('[useChat] receivedConsiderations:', receivedConsiderations.length, receivedConsiderations);
  }, [receivedConsiderations]);

  return {
    // Conversations
    conversations,
    isLoadingConversations,
    errorConversations,
    refreshConversations,
    
    // Current conversation
    currentConversation,
    setCurrentConversation,
    conversationMessages,
    isLoadingMessages,
    loadMessages,
    sendMessage,
    markAsRead,
    
    // Coffee Chat
    coffeeChatRequests,
    receivedCoffeeChats,
    sentCoffeeChats,
    isLoadingCoffeeChats,
    sendCoffeeChatRequest,
    acceptCoffeeChat,
    declineCoffeeChat,
    
    // Considerations
    considerationRequests,
    receivedConsiderations,
    sentConsiderations,
    isLoadingConsiderations,
    sendConsideration,
    acceptConsideration,
    declineConsideration,
    
    // Notifications
    notifications,
    unreadCount,
    isLoadingNotifications,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    
    // Stats
    stats,
    refreshStats,
    
    // Init chat
    initChatFromJob,
    initChatFromProfile,

    // Real-time
    isConnected,
    typingUsers,
    sendTypingIndicator,
  };
}
