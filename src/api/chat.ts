/**
 * Chat API service for theGarage platform.
 * Handles all chat-related API calls to the backend.
 */
import apiClient from './client';

// Types
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role?: string;
  tier?: string;
  is_premium?: boolean;
  avatar?: string;
}

export interface Conversation {
  id: number;
  conversation_type: 'job' | 'coffee' | 'general' | 'team';
  status: string;
  participants: User[];
  participant_details?: ConversationParticipant[];
  job?: number;
  job_details?: JobSummary;
  job_application?: number;
  title?: string;
  initiated_by?: string;
  application_method?: 'manual' | 'auto' | 'recruiter-consideration' | 'quick-apply';
  last_message?: Message;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count?: number;
  other_participant?: User;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: number;
  user: User;
  is_pinned: boolean;
  is_muted: boolean;
  unread_count: number;
  last_read_at?: string;
  is_online: boolean;
  last_seen_at?: string;
}

export interface JobSummary {
  id: number;
  title: string;
  company?: string;
  department?: string;
  location?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: User;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'consideration' | 'interview_scheduled' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
  attachment?: Attachment;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  is_mine?: boolean;
  timestamp_display?: string;
  read_by?: User[];
  delivered_to?: User[];
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface CoffeeChatRequest {
  id: number;
  requester: User;
  recipient: User;
  message: string;
  topic: string;
  topic_display?: string;
  meeting_type: 'virtual' | 'in-person';
  meeting_type_display?: string;
  preferred_date: string;
  preferred_time: string;
  duration: string;
  duration_display?: string;
  location?: string;
  meeting_platform: string;
  platform_display?: string;
  custom_platform_link?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  status_display?: string;
  response_message?: string;
  responded_at?: string;
  conversation?: number;
  created_at: string;
  updated_at: string;
}

export interface ConsiderationRequest {
  id: number;
  recruiter: User;
  candidate: User;
  job: number;
  job_details?: JobSummary;
  message: string;
  status: string;
  status_display?: string;
  match_score?: number;
  candidate_response?: string;
  responded_at?: string;
  conversation?: number;
  job_application?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatNotification {
  id: number;
  notification_type: string;
  notification_type_display?: string;
  conversation?: number;
  message?: number;
  coffee_chat_request?: number;
  consideration_request?: number;
  title: string;
  message_preview: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface ConversationStats {
  total_conversations: number;
  unread_messages: number;
  coffee_chat_requests_sent: number;
  coffee_chat_requests_received: number;
  pending_considerations: number;
}

export interface RecruiterStats {
  response_rate: number;
  avg_response_time: string;
  success_rate: number;
  interview_rate?: number;
  total_hires?: number;
}

export interface CreateMessageRequest {
  conversation: number;
  content: string;
  message_type?: string;
  metadata?: Record<string, any>;
  attachment?: File;
}

export interface CreateCoffeeChatRequest {
  recipient: number;
  message: string;
  topic?: string;
  meeting_type: 'virtual' | 'in-person';
  preferred_date: string;
  preferred_time: string;
  duration: string;
  location?: string;
  meeting_platform: string;
  custom_platform_link?: string;
}

export interface CreateConsiderationRequest {
  candidate: number;
  job: number;
  message: string;
  match_score?: number;
}

// Helper function to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  // Support { data: [...] } wrappers and DRF paginated { results: [...] }
  const payload = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.results)
        ? data.results
        : data;
  return payload;
}

// Conversation APIs
export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.request('/chat/conversations/');
  return handleResponse<Conversation[]>(response);
}

export async function getConversation(id: number): Promise<Conversation> {
  const response = await apiClient.request(`/chat/conversations/${id}/`);
  return handleResponse<Conversation>(response);
}

export async function createConversation(data: {
  conversation_type: string;
  participant_ids: number[];
  job?: number;
  title?: string;
}): Promise<Conversation> {
  const response = await apiClient.request('/chat/conversations/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<Conversation>(response);
}

export async function markConversationAsRead(id: number): Promise<void> {
  await apiClient.request(`/chat/conversations/${id}/mark_read/`, { method: 'POST' });
}

export async function pinConversation(id: number): Promise<{ is_pinned: boolean }> {
  const response = await apiClient.request(`/chat/conversations/${id}/pin/`, { method: 'POST' });
  return handleResponse<{ is_pinned: boolean }>(response);
}

export async function muteConversation(id: number): Promise<{ is_muted: boolean }> {
  const response = await apiClient.request(`/chat/conversations/${id}/mute/`, { method: 'POST' });
  return handleResponse<{ is_muted: boolean }>(response);
}

export async function updateTypingIndicator(id: number, isTyping: boolean): Promise<void> {
  await apiClient.request(`/chat/conversations/${id}/typing/`, {
    method: 'POST',
    body: JSON.stringify({ is_typing: isTyping }),
  });
}

export async function getConversationMessages(
  id: number,
  params?: { before_id?: number; after_id?: number; limit?: number }
): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  if (params?.before_id) queryParams.append('before_id', params.before_id.toString());
  if (params?.after_id) queryParams.append('after_id', params.after_id.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiClient.request(`/chat/conversations/${id}/messages/${query}`);
  return handleResponse<Message[]>(response);
}

export async function getConversationStats(): Promise<ConversationStats> {
  const response = await apiClient.request('/chat/conversations/stats/');
  return handleResponse<ConversationStats>(response);
}

export async function fetchRecruiterStats(userId: number): Promise<RecruiterStats> {
  const response = await apiClient.request(`/chat/conversations/recruiter_stats/?user_id=${userId}`);
  return handleResponse<RecruiterStats>(response);
}

export async function getConversationsByJob(): Promise<
  Array<{
    job_id: number;
    job_title: string;
    total_conversations: number;
    conversations: Conversation[];
  }>
> {
  const response = await apiClient.request('/chat/conversations/by_job/');
  return handleResponse(response);
}

// Message APIs
export async function getMessages(params?: { conversation?: number }): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  if (params?.conversation) queryParams.append('conversation', params.conversation.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiClient.request(`/chat/messages/${query}`);
  return handleResponse<Message[]>(response);
}

export async function sendMessage(data: CreateMessageRequest): Promise<Message> {
  const formData = new FormData();
  formData.append('conversation', data.conversation.toString());
  formData.append('content', data.content);
  if (data.message_type) formData.append('message_type', data.message_type);
  if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
  if (data.attachment) formData.append('attachment', data.attachment);

  const response = await apiClient.request('/chat/messages/', {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
  return handleResponse<Message>(response);
}

export async function markMessageAsRead(id: number): Promise<void> {
  await apiClient.request(`/chat/messages/${id}/read/`, { method: 'POST' });
}

export async function markMessagesAsReadBulk(messageIds: number[]): Promise<void> {
  await apiClient.request('/chat/messages/mark_read_bulk/', {
    method: 'POST',
    body: JSON.stringify({ message_ids: messageIds }),
  });
}

export async function editMessage(id: number, content: string): Promise<Message> {
  const response = await apiClient.request(`/chat/messages/${id}/edit/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return handleResponse<Message>(response);
}

// Coffee Chat Request APIs
export async function getCoffeeChatRequests(): Promise<CoffeeChatRequest[]> {
  const response = await apiClient.request('/chat/coffee-chat-requests/');
  return handleResponse<CoffeeChatRequest[]>(response);
}

export async function getReceivedCoffeeChatRequests(status?: string): Promise<CoffeeChatRequest[]> {
  const query = status ? `?status=${status}` : '';
  const response = await apiClient.request(`/chat/coffee-chat-requests/received/${query}`);
  return handleResponse<CoffeeChatRequest[]>(response);
}

export async function getSentCoffeeChatRequests(status?: string): Promise<CoffeeChatRequest[]> {
  const query = status ? `?status=${status}` : '';
  const response = await apiClient.request(`/chat/coffee-chat-requests/sent/${query}`);
  return handleResponse<CoffeeChatRequest[]>(response);
}

export async function createCoffeeChatRequest(data: CreateCoffeeChatRequest): Promise<CoffeeChatRequest> {
  const response = await apiClient.request('/chat/coffee-chat-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<CoffeeChatRequest>(response);
}

export async function acceptCoffeeChatRequest(id: number, responseMessage?: string): Promise<CoffeeChatRequest> {
  const response = await apiClient.request(`/chat/coffee-chat-requests/${id}/accept/`, {
    method: 'POST',
    body: JSON.stringify({ response_message: responseMessage }),
  });
  return handleResponse<CoffeeChatRequest>(response);
}

export async function declineCoffeeChatRequest(id: number, responseMessage?: string): Promise<CoffeeChatRequest> {
  const response = await apiClient.request(`/chat/coffee-chat-requests/${id}/decline/`, {
    method: 'POST',
    body: JSON.stringify({ response_message: responseMessage }),
  });
  return handleResponse<CoffeeChatRequest>(response);
}

export async function cancelCoffeeChatRequest(id: number): Promise<CoffeeChatRequest> {
  const response = await apiClient.request(`/chat/coffee-chat-requests/${id}/cancel/`, { method: 'POST' });
  return handleResponse<CoffeeChatRequest>(response);
}

// Consideration Request APIs
export async function getConsiderationRequests(): Promise<ConsiderationRequest[]> {
  const response = await apiClient.request('/chat/consideration-requests/');
  return handleResponse<ConsiderationRequest[]>(response);
}

export async function getReceivedConsiderations(status?: string): Promise<ConsiderationRequest[]> {
  const query = status ? `?status=${status}` : '';
  const response = await apiClient.request(`/chat/consideration-requests/received/${query}`);
  return handleResponse<ConsiderationRequest[]>(response);
}

export async function getSentConsiderations(status?: string): Promise<ConsiderationRequest[]> {
  const query = status ? `?status=${status}` : '';
  const response = await apiClient.request(`/chat/consideration-requests/sent/${query}`);
  return handleResponse<ConsiderationRequest[]>(response);
}

export async function createConsiderationRequest(data: CreateConsiderationRequest): Promise<ConsiderationRequest> {
  const response = await apiClient.request('/chat/consideration-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse<ConsiderationRequest>(response);
}

export async function acceptConsideration(
  id: number,
  responseMessage?: string,
  videoResponseIds?: number[]
): Promise<{ success?: boolean; requires_video_prompts?: boolean; missing_prompt_ids?: number[]; consideration?: ConsiderationRequest; job_application?: { id: number; status: string }; error?: string }> {
  const body: Record<string, any> = { response_message: responseMessage };
  if (videoResponseIds) {
    body.video_response_ids = videoResponseIds;
  }
  const response = await apiClient.request(`/chat/consideration-requests/${id}/accept/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok && !data.requires_video_prompts) {
    throw new Error(data.error || data.detail || data.message || `HTTP ${response.status}`);
  }
  return data;
}

export async function declineConsideration(id: number, responseMessage?: string): Promise<ConsiderationRequest> {
  const response = await apiClient.request(`/chat/consideration-requests/${id}/decline/`, {
    method: 'POST',
    body: JSON.stringify({ response_message: responseMessage }),
  });
  return handleResponse<ConsiderationRequest>(response);
}

export async function updateConsiderationStatus(id: number, status: string): Promise<ConsiderationRequest> {
  const response = await apiClient.request(`/chat/consideration-requests/${id}/update_status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  return handleResponse<ConsiderationRequest>(response);
}

// Chat Init APIs
export async function initChatFromJob(
  jobId: number,
  candidateId?: number
): Promise<{ conversation_id: number; created: boolean; conversation: Conversation }> {
  const response = await apiClient.request('/chat/init/from_job/', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, candidate_id: candidateId }),
  });
  return handleResponse(response);
}

export async function initChatFromProfile(
  userId: number
): Promise<{ conversation_id: number; created: boolean; conversation: Conversation }> {
  const response = await apiClient.request('/chat/init/from_profile/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(response);
}

// Notification APIs
export async function getChatNotifications(): Promise<ChatNotification[]> {
  const response = await apiClient.request('/chat/notifications/');
  return handleResponse<ChatNotification[]>(response);
}

export async function markNotificationAsRead(id: number): Promise<ChatNotification> {
  const response = await apiClient.request(`/chat/notifications/${id}/mark_read/`, { method: 'POST' });
  return handleResponse<ChatNotification>(response);
}

export async function markAllNotificationsAsRead(): Promise<{ marked_as_read: number }> {
  const response = await apiClient.request('/chat/notifications/mark_all_read/', { method: 'POST' });
  return handleResponse<{ marked_as_read: number }>(response);
}

export async function getUnreadNotificationCount(): Promise<{ unread_count: number }> {
  const response = await apiClient.request('/chat/notifications/unread_count/');
  return handleResponse<{ unread_count: number }>(response);
}
