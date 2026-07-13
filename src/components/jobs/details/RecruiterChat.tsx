import { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../../hooks/useChat';
import { getConversationMessages } from '../../../api/chat';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Badge, CheckCircle, Crown, MessageCircle, Zap, Calendar, Star, Paperclip, Smile, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: number;
  sender: 'user' | 'recruiter';
  name: string;
  avatar: string | null;
  content: string;
  timestamp: string;
  type: 'message';
}

interface Recruiter {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string | null;
}

interface RecruiterChatProps {
  isPremium: boolean;
  hasApplied?: boolean;
  isApplied?: boolean;
  considerationStatus?: string;
  applicationMethod?: 'manual' | 'quick-apply' | 'recruiter-consideration';
  recruiter?: Recruiter;
  user?: any;
  initialMessages?: Message[];
}

export function RecruiterChat({
  isPremium,
  hasApplied,
  isApplied,
  considerationStatus,
  applicationMethod,
  recruiter,
  user,
  initialMessages = [],
  jobId
}: Readonly<RecruiterChatProps & { jobId?: number }>) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { initChatFromJob, sendMessage: sendApiMessage } = useChat();

  const isAppliedState = hasApplied || isApplied || considerationStatus === 'accepted';
  const canChat = isPremium || applicationMethod === 'recruiter-consideration' || isAppliedState;
  const isAutoApplied = applicationMethod === 'recruiter-consideration';

  // Helper to format API message to component message format
  const formatMessage = useCallback((msg: any, currentUserId?: string): Message => ({
    id: msg.id,
    sender: msg.sender.id === currentUserId ? 'user' : 'recruiter',
    name: msg.sender.first_name || msg.sender.username,
    avatar: null,
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString(),
    type: 'message',
  }), []);

  // Initialize chat when component mounts
  useEffect(() => {
    if (!jobId || !canChat || !user) return;

    const initChat = async () => {
      const conversation = await initChatFromJob(jobId);
      setConversationId(conversation.id);
      const apiMessages = await getConversationMessages(conversation.id);
      setMessages(apiMessages.map((msg) => formatMessage(msg, user?.id)));
    };

    initChat();
  }, [jobId, canChat, initChatFromJob, user?.id, formatMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    try {
      await sendApiMessage({
        conversation: conversationId,
        content: inputMessage,
        message_type: 'text',
      });

      // Refresh messages from API to show the sent message
      const apiMessages = await getConversationMessages(conversationId);
      setMessages(apiMessages.map((msg) => formatMessage(msg, user?.id)));
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getCardStyles = () => {
    if (canChat) {
      return 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200';
    }
    return 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200';
  };

  const getIconStyles = () => {
    if (canChat) {
      return 'bg-gradient-to-r from-green-500 to-emerald-500';
    }
    return 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]';
  };

  return (
    <Card className={`shadow-lg relative overflow-hidden ${getCardStyles()}`}>
      <div className="absolute top-2 right-2">
        <Badge
          className={`text-white ${
            canChat
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]'
          }`}
        >
          {canChat ? <CheckCircle className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
          {canChat ? 'Active' : 'Premium'}
        </Badge>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconStyles()}`}>
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chat with Recruiter</h3>
            <p className="text-sm text-gray-600">
              {canChat ? 'Connected with hiring team' : 'Direct communication with hiring team'}
            </p>
            {!isPremium && isAutoApplied && (
              <p className="text-xs text-green-600 mt-1">✓ Chat enabled - Recruiter reached out to you</p>
            )}
          </div>
        </div>

        {!canChat && (
          <div className="bg-white/60 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Zap className="w-4 h-4 text-[#ff6b35]" />
                <span>Instant messaging with recruiters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-[#ff6b35]" />
                <span>Real-time interview scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Star className="w-4 h-4 text-[#ff6b35]" />
                <span>Priority application status</span>
              </div>
            </div>
          </div>
        )}

        {!isPremium && isAutoApplied && (
          <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  <strong>Special Access:</strong> This recruiter reached out to you first
                </span>
              </div>
              <p className="text-green-700 text-xs">
                Basic users can chat when recruiters send consideration requests (auto-apply)
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div
          className={`space-y-3 max-h-60 overflow-y-auto mb-4 rounded-lg p-3 ${
            canChat ? 'bg-white/80' : 'bg-white/60'
          }`}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.sender === 'user' ? 'ml-8' : ''}`}>
              <div
                className={`rounded-lg p-3 text-sm shadow-sm ${
                  msg.sender === 'user' ? 'bg-orange-50 text-orange-800' : 'bg-white text-gray-600'
                }`}
              >
                {msg.sender === 'recruiter' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={msg.avatar ?? recruiter?.avatar ?? ''} />
                      <AvatarFallback className="text-xs">
                        {msg.name?.split(' ').map((n) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500 font-medium">
                      {msg.name} • {msg.timestamp}
                    </span>
                  </div>
                )}
                {msg.sender === 'user' && (
                  <span className="text-xs text-orange-600 block mb-1 font-medium">
                    {msg.name} • {msg.timestamp}
                  </span>
                )}
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="relative mb-4">
          <div
            className={`border-2 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 backdrop-blur-sm ${
              canChat ? 'border-green-200 bg-white/80' : 'border-orange-200 bg-white/80'
            }`}
          >
            <input
              type="text"
              placeholder={canChat ? 'Type a message...' : 'Type a message to the recruiter...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              disabled={!canChat}
            />
            {!canChat && <span><Lock className="w-4 h-4 text-gray-400" /></span>}
            <Paperclip className="w-4 h-4 text-gray-400" />
            <Smile className="w-4 h-4 text-gray-400" />
          </div>
          {!canChat && (
            <div className="absolute -top-16 left-0 right-0 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white text-sm px-4 py-3 rounded-lg shadow-lg border border-orange-300">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>Upgrade to Premium to chat directly with recruiters and schedule interviews</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canChat ? (
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => alert('Upgrade to Premium to unlock direct chat with recruiters!')}
              className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>

            {/* Pricing Info */}
            <div className="p-3 bg-white/60 rounded-lg border border-orange-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  Premium Plan - <span className="font-semibold text-[#ff6b35]">$19.99/month</span>
                </div>
                <div className="text-xs text-gray-500">Cancel anytime • 7-day free trial available</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
