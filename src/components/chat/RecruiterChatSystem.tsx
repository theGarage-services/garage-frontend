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
  MoreHorizontal,
  Crown,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  Search,
  MessageSquare,
  Coffee,
  ChevronDown,
  ChevronRight,
  Filter} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useChat } from '../../hooks/useChat';
import {
  type CoffeeChatContact,
  type CandidateContact,
  transformReceivedCoffeeChatsToContacts,
  transformConversationsToCandidatesByRole,
  getPendingSentConsiderations,
  computeTotalCoffeeChatUnread,
  computeTotalRoleGroupUnread,
} from '../../api/chatTransforms';
import { type Message, type ConsiderationRequest } from '../../api/chat';
import { EmojiPicker } from './EmojiPicker';
import { ResponsiveChatSplit } from './ResponsiveChatSplit';
import { buildProfileImageUrl } from '@/api/recruiterProfile';
import { recruiterCandidatesApi } from '@/api/recruiterCandidates';

function getApplicationMethodLabel(method?: string): string {
  switch (method) {
    case 'auto': return 'Auto Applied';
    case 'recruiter-consideration': return 'Recruiter Consideration';
    case 'quick-apply': return 'Quick Apply';
    case 'manual':
    default:
      return 'Manual Apply';
  }
}

function getApplicationMethodClasses(method?: string): string {
  switch (method) {
    case 'auto': return 'bg-purple-100 text-purple-700';
    case 'recruiter-consideration': return 'bg-green-100 text-green-700';
    case 'quick-apply': return 'bg-orange-100 text-orange-700';
    case 'manual':
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

// ─── Extracted sub-components to lower renderChatArea cognitive complexity ───

function ChatEmptyState({ activeTab }: Readonly<{ activeTab: string }>) {
  return (
    <Card className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
        <p className="text-sm">
          {activeTab === 'coffee-chats'
            ? 'Choose a networking request to start chatting'
            : 'Choose a candidate to continue the conversation'
          }
        </p>
      </div>
    </Card>
  );
}

function ConsiderationStatusBadge({ consideration }: Readonly<{ consideration: ConsiderationRequest }>) {
  const statusClasses = consideration.status === 'pending'
    ? 'bg-amber-100 text-amber-700'
    : consideration.status === 'accepted'
    ? 'bg-green-100 text-green-700'
    : 'bg-blue-100 text-blue-700';

  const label = consideration.status === 'pending'
    ? 'Consideration Pending'
    : consideration.status === 'accepted'
    ? 'Consideration Accepted'
    : 'Under Consideration';

  return (
    <Badge className={`text-xs px-3 py-1.5 ${statusClasses}`}>
      {consideration.status === 'pending' ? (
        <Clock className="w-3 h-3 mr-1" />
      ) : (
        <CheckCircle className="w-3 h-3 mr-1" />
      )}
      {label}
    </Badge>
  );
}

function ChatMessageBubble({ msg }: Readonly<{ msg: Message }>) {
  return (
    <div className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          msg.is_mine
            ? 'bg-[#ff6b35] text-white'
            : 'bg-white border border-gray-200'
        }`}
      >
        {msg.message_type === 'consideration' && (
          <div className="mb-2 p-2 bg-white/20 rounded border">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Job Consideration</span>
            </div>
          </div>
        )}

        {msg.message_type === 'interview_scheduled' && (
          <div className="mb-2 p-2 bg-white/20 rounded border">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Interview Scheduled</span>
            </div>
          </div>
        )}

        <p className="text-sm leading-relaxed">{msg.content}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
          <span className="text-xs opacity-70">
            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
          {msg.is_mine && (
            <div className="flex items-center gap-1">
              {msg.status === 'read' && <CheckCircle className="w-3 h-3" />}
              {msg.status === 'delivered' && <CheckCircle className="w-3 h-3 opacity-50" />}
              {msg.status === 'sent' && <Clock className="w-3 h-3 opacity-50" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatTypingIndicator({ typingUsers, conversationId }: Readonly<{
  typingUsers: Array<{ userId: number; username: string; conversationId: number }>;
  conversationId?: number;
}>) {
  const activeTypers = typingUsers.filter((t) => t.conversationId === conversationId);
  if (activeTypers.length === 0) return null;

  return (
    <div className="px-4 pb-2 text-xs text-gray-500 animate-pulse">
      {activeTypers.length === 1
        ? `${activeTypers[0].username} is typing...`
        : 'Several people are typing...'}
    </div>
  );
}

interface RecruiterChatSystemProps {
  onBack: () => void;
  initialContact?: any;
  availableJobs?: any[];
  onUpdateCandidateStatus?: (candidateId: string, status: string) => void;
}

export function RecruiterChatSystem({ 
  onBack, 
  initialContact, 
  availableJobs = [],
  onUpdateCandidateStatus
}: Readonly<RecruiterChatSystemProps>) {
  const [activeTab, setActiveTab] = useState<'coffee-chats' | 'job-seekers'>('job-seekers');
  const [selectedContact, setSelectedContact] = useState<CoffeeChatContact | CandidateContact | null>(initialContact);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use chat hook for API integration
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    conversationMessages,
    loadMessages,
    sendMessage: sendApiMessage,
    markAsRead,
    receivedCoffeeChats,
    sendConsideration: sendConsiderationRequest,
    sentConsiderations,
    typingUsers,
    sendTypingIndicator,
  } = useChat();
  const [showConsiderationDialog, setShowConsiderationDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  
  // Toggle filters for Job Seekers tab
  const [showRecruiterInitiated, setShowRecruiterInitiated] = useState(true);
  const [showCandidateInitiated, setShowCandidateInitiated] = useState(true);
  
  const [considerationData, setConsiderationData] = useState({
    jobId: '',
    message: '',
    status: 'applied'
  });
  const [recruiterJobs, setRecruiterJobs] = useState<any[]>(availableJobs);

  // Load recruiter jobs from the API if none are provided via props
  useEffect(() => {
    if (availableJobs.length > 0) {
      setRecruiterJobs(availableJobs);
      return;
    }
    let cancelled = false;
    recruiterCandidatesApi.fetchRecruiterJobs()
      .then((jobs) => {
        if (!cancelled) setRecruiterJobs(jobs);
      })
      .catch((err) => {
        console.error('Failed to load recruiter jobs:', err);
      });
    return () => { cancelled = true; };
  }, [availableJobs]);

  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: '30',
    type: 'video',
    message: '',
    location: '',
    meetingLink: '',
    meetingPlatform: 'zoom'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(currentConversation.id);
      markAsRead(currentConversation.id);
    }
  }, [currentConversation?.id, loadMessages, markAsRead]);

  const selectCandidateContact = (candidate: CandidateContact) => {
    setSelectedContact(candidate);
    const conv = conversations.find(c => c.id.toString() === candidate.id);
    if (conv) setCurrentConversation(conv);
  };

  const selectCoffeeChatContact = (contact: CoffeeChatContact) => {
    setSelectedContact(contact);
    const request = receivedCoffeeChats.find(r => r.id.toString() === contact.id);
    if (request?.conversation) {
      const conv = conversations.find(c => c.id === request.conversation);
      if (conv) setCurrentConversation(conv);
    } else {
      setCurrentConversation(null);
    }
  };

  const sendMessage = async () => {
    if (message.trim() && currentConversation) {
      try {
        await sendApiMessage({
          conversation: currentConversation.id,
          content: message,
          message_type: 'text',
        });
        setMessage('');
        await loadMessages(currentConversation.id);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const submitConsideration = async () => {
    if (considerationData.jobId && considerationData.message.trim() && selectedContact) {
      try {
        await sendConsiderationRequest({
          candidate: Number.parseInt(selectedContact.id),
          job: Number.parseInt(considerationData.jobId),
          message: considerationData.message,
        });

        if (onUpdateCandidateStatus) {
          onUpdateCandidateStatus(selectedContact.id, considerationData.status);
        }

        setShowConsiderationDialog(false);
        setConsiderationData({ jobId: '', message: '', status: 'applied' });
      } catch (err) {
        console.error('Failed to send consideration:', err);
      }
    }
  };

  const scheduleInterview = async () => {
    if (scheduleData.date && scheduleData.time && selectedContact && currentConversation) {
      let locationDetails = '';
      if (scheduleData.type === 'in-person' && scheduleData.location) {
        locationDetails = ` Location: ${scheduleData.location}.`;
      } else if (scheduleData.type === 'video' && scheduleData.meetingLink) {
        locationDetails = ` Meeting link: ${scheduleData.meetingLink}.`;
      } else if (scheduleData.type === 'video' && scheduleData.meetingPlatform) {
        locationDetails = ` Platform: ${scheduleData.meetingPlatform}.`;
      }

      try {
        await sendApiMessage({
          conversation: currentConversation.id,
          content: `I've scheduled an interview for ${scheduleData.date} at ${scheduleData.time}.${locationDetails} ${scheduleData.message}`,
          message_type: 'interview_scheduled',
          metadata: {
            date: scheduleData.date,
            time: scheduleData.time,
            duration: scheduleData.duration,
            type: scheduleData.type,
            location: scheduleData.location,
            meetingLink: scheduleData.meetingLink,
            meetingPlatform: scheduleData.meetingPlatform
          }
        });

        if (onUpdateCandidateStatus) {
          onUpdateCandidateStatus(selectedContact.id, 'interviews');
        }

        setShowScheduleDialog(false);
        setScheduleData({
          date: '',
          time: '',
          duration: '30',
          type: 'video',
          message: '',
          location: '',
          meetingLink: '',
          meetingPlatform: 'zoom'
        });
        await loadMessages(currentConversation.id);
      } catch (err) {
        console.error('Failed to schedule interview:', err);
      }
    }
  };

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
  const coffeeChatContacts = transformReceivedCoffeeChatsToContacts(receivedCoffeeChats);
  const filteredCoffeeChatContacts = coffeeChatContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCandidatesByRole = transformConversationsToCandidatesByRole(
    conversations, searchQuery, { showRecruiterInitiated, showCandidateInitiated }
  );
  const pendingSentConsiderations = getPendingSentConsiderations(sentConsiderations);

  const totalCoffeeChatUnread = computeTotalCoffeeChatUnread(filteredCoffeeChatContacts);
  const totalJobSeekerUnread = computeTotalRoleGroupUnread(filteredCandidatesByRole);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const isCoffeeChatContact = (contact: any): contact is CoffeeChatContact => {
    return 'contactType' in contact;
  };

  const isCandidateContact = (contact: any): contact is CandidateContact => {
    return 'jobRole' in contact;
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
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'coffee-chats' | 'job-seekers')} className="w-full">
          <TabsList className="grid w-full sm:max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="coffee-chats" className="relative text-xs sm:text-sm">
              <Coffee className="w-4 h-4 mr-2" />
              Coffee Chats
              {totalCoffeeChatUnread > 0 && (
                <Badge className="ml-2 bg-[#ff6b35] text-white text-xs h-5 px-2">
                  {totalCoffeeChatUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="job-seekers" className="relative text-xs sm:text-sm">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Seekers
              {totalJobSeekerUnread > 0 && (
                <Badge className="ml-2 bg-[#ff6b35] text-white text-xs h-5 px-2">
                  {totalJobSeekerUnread}
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
                  <div className="p-4 border-b">
                    <div className="relative mb-4">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Coffee className="w-4 h-4" />
                      <span>{filteredCoffeeChatContacts.length} Networking Requests</span>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {filteredCoffeeChatContacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => selectCoffeeChatContact(contact)}
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
                              
                              <p className={`text-xs mb-1 ${
                                selectedContact?.id === contact.id ? 'text-white/80' : 'text-gray-600'
                              }`}>
                                {contact.position}
                              </p>
                              
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

          {/* Job Seekers Tab Content */}
          <TabsContent value="job-seekers">
            <ResponsiveChatSplit
              detailSelected={!!selectedContact}
              onBack={() => setSelectedContact(null)}
            >
              {/* Job Seekers Sidebar with Role Grouping */}
              <Card className="h-full flex flex-col min-w-0">
                  <div className="p-4 border-b space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Toggle Filters */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg min-w-0">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          Filter by
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="recruiter-initiated" className="text-xs min-w-0">Recruiter Initiated</Label>
                        <Switch
                          id="recruiter-initiated"
                          checked={showRecruiterInitiated}
                          onCheckedChange={setShowRecruiterInitiated}
                          className="shrink-0"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="candidate-initiated" className="text-xs min-w-0">Candidate Initiated</Label>
                        <Switch
                          id="candidate-initiated"
                          checked={showCandidateInitiated}
                          onCheckedChange={setShowCandidateInitiated}
                          className="shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 min-w-0">
                    <div className="p-2 min-w-0">
                      {/* Pending Sent Considerations */}
                      {pendingSentConsiderations.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">Pending Considerations</h4>
                          {pendingSentConsiderations.map((req) => (
                            <div
                              key={req.id}
                              className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-2"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 truncate min-w-0">
                                  {req.candidate?.full_name || req.candidate?.username || 'Candidate'}
                                </span>
                                <Badge className="bg-amber-100 text-amber-700 text-xs shrink-0">{req.status}</Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-1 break-words">{req.job_details?.title || 'Unknown Position'}</p>
                              <p className="text-xs text-gray-500 break-words">{req.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {filteredCandidatesByRole.map((roleGroup) => (
                        <div key={roleGroup.roleId} className="mb-2">
                          {/* Role Header - Collapsible */}
                          <button
                            onClick={() => toggleRoleExpansion(roleGroup.roleId)}
                            className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 ${expandedRoles.has(roleGroup.roleId) ? '' : 'hidden'}`} />
                              <ChevronRight className={`w-4 h-4 text-gray-500 shrink-0 ${expandedRoles.has(roleGroup.roleId) ? 'hidden' : ''}`} />
                              <Briefcase className="w-4 h-4 text-[#ff6b35] shrink-0" />
                              <div className="text-left min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{roleGroup.roleTitle}</h3>
                                <p className="text-xs text-gray-500 truncate">{roleGroup.totalConversations} conversations</p>
                              </div>
                            </div>
                            {roleGroup.unreadCount > 0 && (
                              <Badge className="bg-[#ff6b35] text-white text-xs h-5 px-2 shrink-0">
                                {roleGroup.unreadCount}
                              </Badge>
                            )}
                          </button>

                          {/* Candidate List under this role */}
                          {expandedRoles.has(roleGroup.roleId) && (
                            <div className="ml-2 sm:ml-4 mt-1 space-y-1">
                              {roleGroup.candidates.map((candidate) => (
                                <button
                                  key={candidate.id}
                                  type="button"
                                  onClick={() => selectCandidateContact(candidate)}
                                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                    selectedContact?.id === candidate.id
                                      ? 'bg-[#ff6b35] text-white'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative">
                                      <Avatar className="w-10 h-10">
                                        {candidate.avatar ? (
                                          <AvatarImage src={buildProfileImageUrl(candidate.avatar)} />
                                        ) : null}
                                        <AvatarFallback className={
                                          selectedContact?.id === candidate.id
                                            ? "bg-white/20 text-white"
                                            : "bg-[#ff6b35] text-white"
                                        }>
                                          {candidate.avatarFallback}
                                        </AvatarFallback>
                                      </Avatar>
                                      {candidate.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                      )}
                                      {candidate.isPremium && (
                                        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className={`text-sm font-medium truncate min-w-0 ${
                                          selectedContact?.id === candidate.id ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {candidate.name}
                                        </h4>
                                        {candidate.unreadCount > 0 && (
                                          <Badge className="bg-[#ff6b35] text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
                                            {candidate.unreadCount}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Badge className={`text-xs truncate max-w-full ${
                                          selectedContact?.id === candidate.id 
                                            ? 'bg-white/20 text-white' 
                                            : candidate.applicationMethod === 'manual' 
                                              ? 'bg-blue-100 text-blue-700'
                                              : 'bg-purple-100 text-purple-700'
                                        }`}>
                                          {candidate.applicationMethod === 'manual' ? 'Manual' : 'Auto Applied'}
                                        </Badge>
                                      </div>
                                      
                                      <p className={`text-xs truncate mb-1 ${
                                        selectedContact?.id === candidate.id ? 'text-white/70' : 'text-gray-500'
                                      }`}>
                                        {candidate.lastMessage}
                                      </p>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className={`text-xs ${
                                          selectedContact?.id === candidate.id ? 'text-white/60' : 'text-gray-400'
                                        }`}>
                                          {candidate.lastMessageTime}
                                        </span>
                                        {candidate.matchScore && (
                                          <span className={`text-xs font-medium ${
                                            selectedContact?.id === candidate.id ? 'text-white' : 'text-[#ff6b35]'
                                          }`}>
                                            {candidate.matchScore}%
                                          </span>
                                        )}
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
        </Tabs>
      </div>
    </div>
  );

  function renderChatArea() {
    if (!selectedContact) {
      return <ChatEmptyState activeTab={activeTab} />;
    }

    const candidateUserId = currentConversation?.other_participant?.id?.toString()
      || (isCandidateContact(selectedContact) ? selectedContact.id : '');
    const selectedJobId = isCandidateContact(selectedContact)
      ? selectedContact.jobId
      : '';

    const activeConsideration = isCandidateContact(selectedContact)
      ? sentConsiderations.find(
          (req) => {
            const reqJobId = req.job_details?.id?.toString()
              || req.job?.toString()
              || '';
            const candidateMatch = req.candidate.id.toString() === candidateUserId;
            const jobMatch = reqJobId === selectedJobId;
            const statusOk = req.status !== 'declined';
            return candidateMatch && jobMatch && statusOk;
          }
        )
      : null;

    return (
      <Card className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10">
                  {selectedContact.avatar ? (
                    <AvatarImage src={buildProfileImageUrl(selectedContact.avatar)} />
                  ) : null}
                  <AvatarFallback className="bg-[#ff6b35] text-white">
                    {selectedContact.avatarFallback}
                  </AvatarFallback>
                </Avatar>
                {selectedContact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
                  {selectedContact.name}
                  {selectedContact.isPremium && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">{selectedContact.position}</p>
                {isCoffeeChatContact(selectedContact) && (
                  <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">
                    <Coffee className="w-3 h-3 mr-1" />
                    Coffee Chat Request
                  </Badge>
                )}
                {isCandidateContact(selectedContact) && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                      {currentConversation?.job_details?.title || selectedContact.jobRole}
                    </Badge>
                    <Badge className={`text-xs ${getApplicationMethodClasses(selectedContact.applicationMethod)}`}>
                      {getApplicationMethodLabel(selectedContact.applicationMethod)}
                    </Badge>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedContact.isOnline ? 'Online now' : 'Last seen 1 hour ago'}
                </p>
              </div>
            </div>

            {/* Action Buttons - Only for candidate contacts */}
            {isCandidateContact(selectedContact) && (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {activeConsideration ? (
                  <ConsiderationStatusBadge consideration={activeConsideration} />
                ) : (
                  <Dialog open={showConsiderationDialog} onOpenChange={setShowConsiderationDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Briefcase className="w-4 h-4 mr-1" />
                        Send Consideration
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Send Job Consideration</DialogTitle>
                      <DialogDescription>
                        Send a personalized job consideration request to this candidate.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Job Position</Label>
                        <Select value={considerationData.jobId} onValueChange={(value: any) => setConsiderationData(prev => ({ ...prev, jobId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a job position..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recruiterJobs.map((job: any) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title} - {job.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Status Update</Label>
                        <Select value={considerationData.status} onValueChange={(value: any) => setConsiderationData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consider">Consider</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interviews">Interviews</SelectItem>
                            <SelectItem value="offers">Offers</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          placeholder="Hi [Name], I'm excited to share that we'd like to move forward with your application..."
                          value={considerationData.message}
                          onChange={(e) => setConsiderationData(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <Button 
                        onClick={submitConsideration}
                        className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                        disabled={!considerationData.jobId || !considerationData.message.trim()}
                      >
                        Send Consideration
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                )}

                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Schedule Interview</DialogTitle>
                      <DialogDescription>
                        Schedule an interview with this candidate.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <input
                            type="date"
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <input
                            type="time"
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Duration</Label>
                          <Select value={scheduleData.duration} onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, duration: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={scheduleData.type} onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video Call</SelectItem>
                              <SelectItem value="phone">Phone Call</SelectItem>
                              <SelectItem value="in-person">In Person</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {scheduleData.type === 'in-person' && (
                        <div>
                          <Label>Location</Label>
                          <Input
                            placeholder="Enter meeting location..."
                            value={scheduleData.location}
                            onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      )}
                      
                      {scheduleData.type === 'video' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Meeting Platform</Label>
                            <Select value={scheduleData.meetingPlatform} onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, meetingPlatform: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zoom">Zoom</SelectItem>
                                <SelectItem value="teams">Microsoft Teams</SelectItem>
                                <SelectItem value="meet">Google Meet</SelectItem>
                                <SelectItem value="webex">Cisco Webex</SelectItem>
                                <SelectItem value="custom">Custom Link</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {scheduleData.meetingPlatform === 'custom' && (
                            <div>
                              <Label>Meeting Link</Label>
                              <Input
                                placeholder="https://..."
                                value={scheduleData.meetingLink}
                                onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          placeholder="Looking forward to our interview..."
                          value={scheduleData.message}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, message: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      
                      <Button 
                        onClick={scheduleInterview}
                        className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                        disabled={!scheduleData.date || !scheduleData.time}
                      >
                        Schedule Interview
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {conversationMessages.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <ChatTypingIndicator
          typingUsers={typingUsers}
          conversationId={currentConversation?.id}
        />

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="pr-12"
              />
              <EmojiPicker onEmojiSelect={(emoji: string) => handleInputChange(message + emoji)} />
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
      </Card>
    );
  }
}
