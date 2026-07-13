import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  Search,
  Users,
  MessageSquare,
  Coffee,
  ChevronDown,
  ChevronRight,
  Filter,
  Crown,
  TrendingUp,
  Award,
  Target,
  MoreHorizontal,
  HandHeart,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useChat } from '../../hooks/useChat';
import type { Message as ApiMessage, RecruiterStats } from '../../api/chat';
import { fetchRecruiterStats } from '../../api/chat';
import {
  type CoffeeChatContact,
  type RecruiterContact,
  type ConsiderationContact,
  type MessageSender,
  transformConversationsToCoffeeChatContacts,
  transformConversationsToRecruitersByRole,
  transformReceivedConsiderationsToContacts,
  computeConsiderationUnreadCount,
  computeTotalCoffeeChatUnread,
  computeTotalRoleGroupUnread,
  getContactType,
  getRecruiterStats,
} from '../../api/chatTransforms';
import { EmojiPicker } from './EmojiPicker';
import { ResponsiveChatSplit } from './ResponsiveChatSplit';
import { buildProfileImageUrl } from '@/api/recruiterProfile';
import { VideoApplicationModal } from '../jobs/applications/VideoApplicationModal';

type MessageType = 'text' | 'file' | 'consideration' | 'interview-scheduled';
type MessageStatus = 'sent' | 'delivered' | 'read';
type ActiveTab = 'coffee-chats' | 'recruiters' | 'considerations';
type ContactUnion = CoffeeChatContact | RecruiterContact | ConsiderationContact;

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  type: MessageType;
  status: MessageStatus;
  metadata?: any;
  isMine?: boolean;
}

interface JobSeekerChatSystemProps {
  onBack: () => void;
  initialContact?: any;
  user?: any;
}

export function JobSeekerChatSystem({ 
  onBack, 
  initialContact}: Readonly<JobSeekerChatSystemProps>) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recruiters');
  const [selectedContact, setSelectedContact] = useState<ContactUnion | null>(initialContact);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [selectedConsideration, setSelectedConsideration] = useState<ConsiderationContact | null>(null);
  const [considerationResponse, setConsiderationResponse] = useState('');
  const [activeVideoFlow, setActiveVideoFlow] = useState<ConsiderationContact | null>(null);
  const [recruiterStatsCache, setRecruiterStatsCache] = useState<Record<string, RecruiterStats>>({});
  
  // Toggle filters for Coffee Chats tab
  const [showRecruiters, setShowRecruiters] = useState(true);
  const [showJobSeekers, setShowJobSeekers] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use chat hook for API integration
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    conversationMessages,
    loadMessages,
    sendMessage: sendApiMessage,
    markAsRead,
    receivedConsiderations,
    acceptConsideration,
    declineConsideration,
    typingUsers,
    sendTypingIndicator,
  } = useChat();

  // Messages now come from API via conversationMessages
  const messages: Message[] = conversationMessages.map((apiMsg: ApiMessage) => ({
    id: apiMsg.id.toString(),
    sender: apiMsg.sender.role === 'recruiter' ? 'recruiter' : 'job-seeker',
    content: apiMsg.content,
    timestamp: new Date(apiMsg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    type: apiMsg.message_type as MessageType,
    status: apiMsg.status as MessageStatus,
    metadata: apiMsg.metadata,
    isMine: apiMsg.is_mine,
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch real recruiter stats when a recruiter contact is selected
  useEffect(() => {
    const contactType = selectedContact ? getContactType(selectedContact) : null;
    if (contactType !== 'recruiter' || !selectedContact) return;

    const recruiterUserId = currentConversation?.other_participant?.id;
    if (!recruiterUserId) return;

    const cacheKey = recruiterUserId.toString();
    if (recruiterStatsCache[cacheKey]) return;

    fetchRecruiterStats(recruiterUserId)
      .then((stats) => {
        setRecruiterStatsCache((prev) => ({ ...prev, [cacheKey]: stats }));
      })
      .catch(() => {
        // Silently fail; fallback stats (0 / 'N/A') will be shown
      });
  }, [selectedContact, currentConversation?.other_participant?.id, recruiterStatsCache]);

  // Send message via API
  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation) return;

    try {
      await sendApiMessage({
        conversation: currentConversation.id,
        content: message,
        message_type: 'text',
      });
      setMessage('');
      // Refresh messages
      await loadMessages(currentConversation.id);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(currentConversation.id);
      markAsRead(currentConversation.id);
    }
  }, [currentConversation?.id, loadMessages, markAsRead]);


  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  // Use transform helpers from API layer
  const filteredCoffeeChatContacts = transformConversationsToCoffeeChatContacts(
    conversations, searchQuery, { showRecruiters, showJobSeekers }
  );
  const filteredRecruitersByRole = transformConversationsToRecruitersByRole(
    conversations, searchQuery
  );
  const considerationContacts = transformReceivedConsiderationsToContacts(receivedConsiderations);

  const totalCoffeeChatUnread = computeTotalCoffeeChatUnread(filteredCoffeeChatContacts);
  const totalRecruiterUnread = computeTotalRoleGroupUnread(filteredRecruitersByRole);
  const pendingConsiderationsCount = computeConsiderationUnreadCount(receivedConsiderations);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    if (currentConversation) {
      sendTypingIndicator(currentConversation.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(currentConversation.id, false);
      }, 1500);
    }
  };

  const selectContact = (contact: ContactUnion) => {
    setSelectedContact(contact);
    setSelectedConsideration(null);
    if ('considerationId' in contact) {
      // Consideration contact - if it has a linked conversation, load it
      if (contact.hasConversation) {
        const conv = conversations.find(c => c.id.toString() === contact.id);
        if (conv) setCurrentConversation(conv);
      } else {
        setCurrentConversation(null);
      }
    } else {
      // Regular contact - id is the conversation id
      const conv = conversations.find(c => c.id.toString() === contact.id);
      if (conv) setCurrentConversation(conv);
    }
  };

  const handleAcceptConsideration = async (considerationId: number) => {
    try {
      const result = await acceptConsideration(considerationId, considerationResponse);
      if (result.requires_video_prompts) {
        setActiveVideoFlow(selectedConsideration);
        return;
      }
      setSelectedConsideration(null);
      setConsiderationResponse('');
    } catch (err) {
      console.error('Failed to accept consideration:', err);
    }
  };

  const handleCompleteVideoFlow = async (responses: any[]) => {
    if (!activeVideoFlow) return;
    const videoResponseIds = responses.map((r) => Number(r.id)).filter(Boolean);
    try {
      const result = await acceptConsideration(activeVideoFlow.considerationId, considerationResponse, videoResponseIds);
      if (result.success) {
        setActiveVideoFlow(null);
        setSelectedConsideration(null);
        setConsiderationResponse('');
      } else {
        console.error('Failed to accept consideration after video upload:', result.error);
      }
    } catch (err) {
      console.error('Failed to accept consideration after video upload:', err);
    }
  };

  const handleDeclineConsideration = async (considerationId: number) => {
    try {
      await declineConsideration(considerationId, considerationResponse);
      setSelectedConsideration(null);
      setConsiderationResponse('');
    } catch (err) {
      console.error('Failed to decline consideration:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-4 mb-6 w-full">
          <Button
            variant="ghost"
            onClick={onBack}
            className="self-start text-gray-600 hover:text-[#ff6b35]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="w-full text-center sm:w-auto sm:flex-1 sm:text-left">
            <h1 className="text-xl sm:text-2xl text-gray-900">Messages</h1>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as ActiveTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:max-w-lg mx-auto mb-6 h-auto min-h-9">
            <TabsTrigger value="coffee-chats" className="relative text-xs sm:text-sm whitespace-normal h-auto py-2">
              <Coffee className="w-4 h-4 mr-2" />
              Coffee Chats
              {totalCoffeeChatUnread > 0 && (
                <Badge className="ml-2 bg-[#ff6b35] text-white text-xs h-5 px-2">
                  {totalCoffeeChatUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="relative text-xs sm:text-sm whitespace-normal h-auto py-2">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Conversations
              {totalRecruiterUnread > 0 && (
                <Badge className="ml-2 bg-[#ff6b35] text-white text-xs h-5 px-2">
                  {totalRecruiterUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="considerations" className="relative text-xs sm:text-sm whitespace-normal h-auto py-2">
              <HandHeart className="w-4 h-4 mr-2" />
              Considerations
              {pendingConsiderationsCount > 0 && (
                <Badge className="ml-2 bg-[#ff6b35] text-white text-xs h-5 px-2">
                  {pendingConsiderationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Coffee Chats Tab Content */}
          <TabsContent value="coffee-chats">
            <ResponsiveChatSplit
              detailSelected={!!selectedContact}
              onBack={() => setSelectedContact(null)}
            >
              {/* Coffee Chat Contacts Sidebar */}
              <Card className="h-full flex flex-col">
                  <div className="p-4 border-b space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Toggle Filters */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          Show
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-recruiters" className="text-xs">Recruiters</Label>
                        <Switch
                          id="show-recruiters"
                          checked={showRecruiters}
                          onCheckedChange={setShowRecruiters}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-job-seekers" className="text-xs">Fellow Job Seekers</Label>
                        <Switch
                          id="show-job-seekers"
                          checked={showJobSeekers}
                          onCheckedChange={setShowJobSeekers}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Coffee className="w-4 h-4" />
                      <span>{filteredCoffeeChatContacts.length} Contacts</span>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {filteredCoffeeChatContacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => selectContact(contact)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-2 ${
                            selectedContact?.id === contact.id
                              ? 'bg-[#ff6b35] text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                {contact.avatar ? (
                                  <AvatarImage src={buildProfileImageUrl(contact.avatar)} />
                                ) : null}
                                <AvatarFallback className={
                                  selectedContact?.id === contact.id
                                    ? "bg-white/20 text-white"
                                    : contact.contactType === 'recruiter'
                                      ? "bg-blue-500 text-white"
                                      : "bg-[#ff6b35] text-white"
                                }>
                                  {contact.avatarFallback}
                                </AvatarFallback>
                              </Avatar>
                              {contact.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                              {contact.isPremium && (
                                <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium truncate ${
                                  selectedContact?.id === contact.id ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {contact.name}
                                </h4>
                                {contact.unreadCount > 0 && (
                                  <Badge className="bg-[#ff6b35] text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {contact.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 mb-1">
                                <p className={`text-xs ${
                                  selectedContact?.id === contact.id ? 'text-white/80' : 'text-gray-600'
                                }`}>
                                  {contact.position}
                                </p>
                                {contact.contactType === 'recruiter' && (
                                  <Badge className={`text-xs ${
                                    selectedContact?.id === contact.id 
                                      ? 'bg-white/20 text-white'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Recruiter
                                  </Badge>
                                )}
                              </div>
                              
                              <p className={`text-xs truncate mb-1 ${
                                selectedContact?.id === contact.id ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                {contact.lastMessage}
                              </p>
                              
                              <span className={`text-xs ${
                                selectedContact?.id === contact.id ? 'text-white/60' : 'text-gray-400'
                              }`}>
                                {contact.lastMessageTime}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
              </Card>

              {/* Chat Area */}
              {renderChatArea()}
            </ResponsiveChatSplit>
          </TabsContent>

          {/* Recruiters Tab Content */}
          <TabsContent value="recruiters">
            <ResponsiveChatSplit
              detailSelected={!!selectedContact}
              onBack={() => setSelectedContact(null)}
            >
              {/* Recruiters Sidebar with Role Grouping */}
              <Card className="h-full flex flex-col">
                  <div className="p-4 border-b space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search recruiters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{filteredRecruitersByRole.length} Job Positions</span>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {filteredRecruitersByRole.map((roleGroup) => (
                        <div key={roleGroup.roleId} className="mb-2">
                          {/* Role Header - Collapsible */}
                          <button
                            onClick={() => toggleRoleExpansion(roleGroup.roleId)}
                            className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {expandedRoles.has(roleGroup.roleId) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              )}
                              <Briefcase className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
                              <div className="text-left min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{roleGroup.roleTitle}</h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500">{roleGroup.company}</p>
                                  <Badge className={`text-xs ${
                                    roleGroup.applicationMethod === 'manual' 
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {roleGroup.applicationMethod === 'manual' ? 'Manual' : 'Auto'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {roleGroup.unreadCount > 0 && (
                              <Badge className="bg-[#ff6b35] text-white text-xs h-5 px-2 flex-shrink-0">
                                {roleGroup.unreadCount}
                              </Badge>
                            )}
                          </button>

                          {/* Recruiter List under this role */}
                          {expandedRoles.has(roleGroup.roleId) && (
                            <div className="ml-4 mt-1 space-y-1">
                              {roleGroup.recruiters.map((recruiter) => (
                                <button
                                  key={recruiter.id}
                                  type="button"
                                  onClick={() => selectContact(recruiter)}
                                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                    selectedContact?.id === recruiter.id
                                      ? 'bg-[#ff6b35] text-white'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative">
                                      <Avatar className="w-10 h-10">
                                        {recruiter.avatar ? (
                                          <AvatarImage src={buildProfileImageUrl(recruiter.avatar)} />
                                        ) : null}
                                        <AvatarFallback className={
                                          selectedContact?.id === recruiter.id
                                            ? "bg-white/20 text-white"
                                            : "bg-blue-500 text-white"
                                        }>
                                          {recruiter.avatarFallback}
                                        </AvatarFallback>
                                      </Avatar>
                                      {recruiter.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                      )}
                                      {recruiter.isPremium && (
                                        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className={`text-sm font-medium truncate ${
                                          selectedContact?.id === recruiter.id ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {recruiter.name}
                                        </h4>
                                        {recruiter.unreadCount > 0 && (
                                          <Badge className="bg-[#ff6b35] text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                            {recruiter.unreadCount}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <p className={`text-xs mb-1 ${
                                        selectedContact?.id === recruiter.id ? 'text-white/80' : 'text-gray-600'
                                      }`}>
                                        {recruiter.position}
                                      </p>
                                      
                                      <p className={`text-xs truncate mb-2 ${
                                        selectedContact?.id === recruiter.id ? 'text-white/70' : 'text-gray-500'
                                      }`}>
                                        {recruiter.lastMessage}
                                      </p>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className={`text-xs ${
                                          selectedContact?.id === recruiter.id ? 'text-white/60' : 'text-gray-400'
                                        }`}>
                                          {recruiter.lastMessageTime}
                                        </span>
                                        <div className={`flex items-center gap-1 text-xs ${
                                          selectedContact?.id === recruiter.id ? 'text-white' : 'text-[#ff6b35]'
                                        }`}>
                                          <TrendingUp className="w-3 h-3" />
                                          {recruiter.responseRate}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
              </Card>

              {/* Chat Area */}
              {renderChatArea()}
            </ResponsiveChatSplit>
          </TabsContent>

          {/* Considerations Tab Content */}
          <TabsContent value="considerations">
            <ResponsiveChatSplit
              detailSelected={!!selectedConsideration}
              onBack={() => {
                setSelectedConsideration(null);
                setSelectedContact(null);
              }}
            >
              {/* Considerations Sidebar */}
              <Card className="h-full flex flex-col">
                  <div className="p-4 border-b space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search considerations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HandHeart className="w-4 h-4" />
                      <span>{considerationContacts.length} Considerations</span>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {considerationContacts.map((contact) => (
                        <button
                          key={contact.considerationId}
                          type="button"
                          onClick={() => {
                            selectContact(contact);
                            setSelectedConsideration(contact);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-2 ${
                            selectedConsideration?.considerationId === contact.considerationId
                              ? 'bg-[#ff6b35] text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                {contact.avatar ? (
                                  <AvatarImage src={buildProfileImageUrl(contact.avatar)} />
                                ) : null}
                                <AvatarFallback className={
                                  selectedConsideration?.considerationId === contact.considerationId
                                    ? "bg-white/20 text-white"
                                    : "bg-blue-500 text-white"
                                }>
                                  {contact.avatarFallback}
                                </AvatarFallback>
                              </Avatar>
                              {contact.isPremium && (
                                <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium truncate ${
                                  selectedConsideration?.considerationId === contact.considerationId ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {contact.name}
                                </h4>
                                <Badge className={`text-xs ${
                                  contact.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : contact.status === 'accepted'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                }`}>
                                  {contact.status}
                                </Badge>
                              </div>
                              <p className={`text-xs mb-1 ${
                                selectedConsideration?.considerationId === contact.considerationId ? 'text-white/80' : 'text-gray-600'
                              }`}>
                                {contact.jobTitle}
                              </p>
                              <p className={`text-xs truncate ${
                                selectedConsideration?.considerationId === contact.considerationId ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                {contact.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
              </Card>

              {/* Chat Area */}
              {renderConsiderationChatArea()}
            </ResponsiveChatSplit>
          </TabsContent>
        </Tabs>
      </div>

      {activeVideoFlow && (
        <VideoApplicationModal
          jobId={Number(activeVideoFlow.jobId)}
          submitLabel="Submit & Accept Interest"
          onComplete={handleCompleteVideoFlow}
          onCancel={() => setActiveVideoFlow(null)}
        />
      )}
    </div>
  );

  function renderConsiderationChatArea() {
    if (!selectedConsideration) {
      return (
        <Card className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <HandHeart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Select a consideration</h3>
            <p className="text-sm">View job considerations from recruiters</p>
          </div>
        </Card>
      );
    }

    const isPending = selectedConsideration.status === 'pending';

    return (
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              {selectedConsideration.avatar ? (
                <AvatarImage src={buildProfileImageUrl(selectedConsideration.avatar)} />
              ) : null}
              <AvatarFallback className="bg-blue-500 text-white">
                {selectedConsideration.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{selectedConsideration.name}</h3>
              <p className="text-sm text-gray-600">{selectedConsideration.jobTitle}</p>
              <Badge className={`mt-1 text-xs ${
                selectedConsideration.status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : selectedConsideration.status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {selectedConsideration.status}
              </Badge>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Job Consideration</span>
              </div>
              <p className="text-sm text-gray-700">{selectedConsideration.message}</p>
              {selectedConsideration.matchScore && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                  <Target className="w-3 h-3" />
                  Match Score: {selectedConsideration.matchScore}%
                </div>
              )}
            </div>

            {selectedConsideration.status === 'accepted' && selectedConsideration.hasConversation && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  You accepted this consideration. Chat is available in Job Conversations.
                </p>
              </div>
            )}

            {selectedConsideration.status === 'declined' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">You declined this consideration.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {isPending && (
          <div className="p-4 border-t space-y-3">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={2}
              placeholder="Add a response message (optional)..."
              value={considerationResponse}
              onChange={(e) => setConsiderationResponse(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleAcceptConsideration(selectedConsideration.considerationId)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                onClick={() => handleDeclineConsideration(selectedConsideration.considerationId)}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XSquare className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  function renderChatArea() {
    if (!selectedContact) {
      return <EmptyChatState activeTab={activeTab} />;
    }

    const contactType = getContactType(selectedContact);
    const showRecruiterStats = contactType === 'recruiter' && !('considerationId' in selectedContact);

    return (
      <Card className="h-full flex flex-col">
        <ChatHeader
          contact={selectedContact}
          contactType={contactType}
          activeTab={activeTab}
        />
        {showRecruiterStats && (
          <RecruiterStats
            contact={selectedContact}
            realStats={
              recruiterStatsCache[currentConversation?.other_participant?.id?.toString() ?? ''] ?? null
            }
          />
        )}
        <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        <TypingIndicator typingUsers={typingUsers} currentConversationId={currentConversation?.id} />
        <MessageInput
          message={message}
          setMessage={handleInputChange}
          sendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
        />
      </Card>
    );
  }
}

// Sub-components for renderChatArea

interface EmptyChatStateProps {
  activeTab: ActiveTab;
}

function EmptyChatState({ activeTab }: Readonly<EmptyChatStateProps>) {
  return (
    <Card className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
        <p className="text-sm">
          {activeTab === 'coffee-chats'
            ? 'Choose a contact to start networking'
            : 'Choose a recruiter to continue the conversation'
          }
        </p>
      </div>
    </Card>
  );
}

interface ChatHeaderProps {
  contact: ContactUnion;
  contactType: MessageSender;
  activeTab: ActiveTab;
}

function ChatHeader({ contact, contactType, activeTab }: Readonly<ChatHeaderProps>) {
  const isRecruiter = contactType === 'recruiter';
  const avatarColor = isRecruiter ? 'bg-blue-500' : 'bg-[#ff6b35]';

  return (
    <div className="p-4 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-10 h-10">
              {contact.avatar ? (
                <AvatarImage src={buildProfileImageUrl(contact.avatar)} />
              ) : null}
              <AvatarFallback className={`${avatarColor} text-white`}>
                {contact.avatarFallback}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
              {contact.name}
              {contact.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
            </h3>
            <p className="text-sm text-gray-600">{contact.position}</p>
            <ChatBadges contact={contact} contactType={contactType} activeTab={activeTab} />
            <p className="text-xs text-gray-500 mt-1">
              {contact.isOnline ? 'Online now' : 'Last seen 1 hour ago'}
            </p>
          </div>
        </div>

        <Button size="sm" variant="outline" className="self-start sm:self-auto">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface ChatBadgesProps {
  contact: ContactUnion;
  contactType: MessageSender;
  activeTab: ActiveTab;
}

function ChatBadges({ contact, contactType, activeTab }: Readonly<ChatBadgesProps>) {
  const badges = [];

  if ('contactType' in contact && activeTab === 'coffee-chats') {
    badges.push(
      <Badge key="coffee" className="bg-amber-100 text-amber-700 text-xs">
        <Coffee className="w-3 h-3 mr-1" />
        Coffee Chat
      </Badge>
    );
  }

  if (contactType === 'recruiter') {
    badges.push(
      <Badge key="recruiter" className="bg-blue-100 text-blue-700 text-xs">Recruiter</Badge>
    );
  } else if ('contactType' in contact && contact.contactType === 'job-seeker') {
    badges.push(
      <Badge key="jobseeker" className="bg-green-100 text-green-700 text-xs">
        <Users className="w-3 h-3 mr-1" />
        Job Seeker
      </Badge>
    );
  }

  if ('jobRole' in contact) {
    badges.push(
      <Badge key="role" className="bg-gray-100 text-gray-700 text-xs">{contact.jobRole}</Badge>,
      <Badge
        key="method"
        className={`text-xs ${
          contact.applicationMethod === 'manual'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}
      >
        {contact.applicationMethod === 'manual' ? 'Manual Apply' : 'Auto Applied'}
      </Badge>
    );
  }

  return <div className="flex items-center gap-2 mt-1">{badges}</div>;
}

interface RecruiterStatsProps {
  contact: ContactUnion;
  realStats: RecruiterStats | null;
}

function RecruiterStats({ contact, realStats }: Readonly<RecruiterStatsProps>) {
  const stats = getRecruiterStats(contact, realStats);

  return (
    <div className="mt-4 mx-4 grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
      <StatItem icon={<TrendingUp className="w-3 h-3 text-green-600" />} value={`${stats.responseRate}%`} label="Response Rate" />
      <StatItem icon={<Clock className="w-3 h-3 text-blue-600" />} value={stats.avgResponseTime} label="Avg Response" />
      <StatItem icon={<Award className="w-3 h-3 text-yellow-600" />} value={`${stats.successRate}%`} label="Success Rate" />
      <StatItem
        icon={<Target className="w-3 h-3 text-[#ff6b35]" />}
        value={stats.fourthStat.value + (stats.fourthStat.isPercentage ? '%' : '')}
        label={stats.fourthStat.label}
      />
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatItem({ icon, value, label }: Readonly<StatItemProps>) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900">
        {icon}
        {value}
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function MessageList({ messages, messagesEndRef }: Readonly<MessageListProps>) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

interface MessageItemProps {
  message: Message;
}

function MessageItem({ message }: Readonly<MessageItemProps>) {
  const isJobSeeker = message.isMine ?? (message.sender === 'job-seeker');
  const isRecruiter = !isJobSeeker;

  const bgClass = isJobSeeker
    ? 'bg-[#ff6b35] text-white'
    : isRecruiter
      ? 'bg-blue-50 border border-blue-200'
      : 'bg-white border border-gray-200';

  return (
    <div className={`flex ${isJobSeeker ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] p-3 rounded-lg ${bgClass}`}>
        {message.type === 'consideration' && <MessageMetadata icon={<Briefcase className="w-4 h-4" />} text={`Job Consideration: ${message.metadata?.jobTitle}`} />}
        {message.type === 'interview-scheduled' && <MessageMetadata icon={<Calendar className="w-4 h-4" />} text="Interview Scheduled" />}

        <p className="text-sm leading-relaxed">{message.content}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/20">
          <span className="text-xs opacity-70">{message.timestamp}</span>
          {isJobSeeker && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

interface MessageMetadataProps {
  icon: React.ReactNode;
  text: string;
}

function MessageMetadata({ icon, text }: Readonly<MessageMetadataProps>) {
  return (
    <div className="mb-2 p-2 bg-white/20 rounded border">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
}

interface MessageStatusProps {
  status: MessageStatus;
}

function MessageStatus({ status }: Readonly<MessageStatusProps>) {
  const iconClass = 'w-3 h-3';

  if (status === 'read') return <CheckCircle className={iconClass} />;
  if (status === 'delivered') return <CheckCircle className={`${iconClass} opacity-50`} />;
  return <Clock className={`${iconClass} opacity-50`} />;
}

interface TypingIndicatorProps {
  typingUsers: { userId: number; username: string; conversationId: number }[];
  currentConversationId?: number;
}

function TypingIndicator({ typingUsers, currentConversationId }: Readonly<TypingIndicatorProps>) {
  const activeTypers = typingUsers.filter(
    (t) => t.conversationId === currentConversationId
  );
  if (activeTypers.length === 0) return null;

  const label = activeTypers.length === 1
    ? `${activeTypers[0].username} is typing...`
    : 'Several people are typing...';

  return (
    <div className="px-4 pb-2 text-xs text-gray-500 animate-pulse">
      {label}
    </div>
  );
}

interface MessageInputProps {
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

function MessageInput({ message, setMessage, sendMessage, handleKeyPress }: Readonly<MessageInputProps>) {
  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline">
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="pr-12"
          />
          <EmojiPicker onEmojiSelect={(emoji: string) => setMessage(message + emoji)} />
        </div>
        <Button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
