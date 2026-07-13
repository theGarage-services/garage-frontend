import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Coffee, 
  MapPin, 
  Video, 
  Building, 
  Send, 
  Crown,
  Briefcase,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { createCoffeeChatRequest, type CreateCoffeeChatRequest } from '../../api/chat';

interface CoffeeChatRequestProps {
  person: {
    id: string | number;
    name: string;
    title?: string;
    company?: string;
    location: string;
    avatar: string;
    type: 'job-seeker' | 'recruiter';
    rank?: number;
    hires?: number;
    score?: number;
  };
  onSendRequest?: (requestData: any) => void;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CoffeeChatRequest({ person, onSendRequest, onClose, onSuccess }: Readonly<CoffeeChatRequestProps>) {
  const [requestData, setRequestData] = useState<{
    meetingType: 'virtual' | 'in-person';
    preferredTime: string;
    preferredDate: string;
    duration: string;
    location: string;
    meetingPlatform: string;
    customLink: string;
    message: string;
    topic: string;
  }>({
    meetingType: 'virtual',
    preferredTime: '',
    preferredDate: '',
    duration: '30',
    location: '',
    meetingPlatform: 'zoom',
    customLink: '',
    message: '',
    topic: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!requestData.message.trim() || !requestData.preferredDate || !requestData.preferredTime) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiData: CreateCoffeeChatRequest = {
        recipient: typeof person.id === 'string' ? Number.parseInt(person.id) : person.id,
        message: requestData.message,
        topic: requestData.topic || undefined,
        meeting_type: requestData.meetingType,
        preferred_date: requestData.preferredDate,
        preferred_time: requestData.preferredTime,
        duration: requestData.duration,
        location: requestData.location || undefined,
        meeting_platform: requestData.meetingPlatform,
        custom_platform_link: requestData.customLink || undefined,
      };

      const result = await createCoffeeChatRequest(apiData);
      
      setIsSuccess(true);
      
      // Call optional callback
      if (onSendRequest) {
        onSendRequest({
          recipientId: person.id,
          recipientName: person.name,
          recipientType: person.type,
          ...requestData,
          requestedAt: new Date().toISOString(),
          apiResult: result
        });
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send coffee chat request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedTopics = person.type === 'recruiter' 
    ? [
        'Career Opportunities',
        'Industry Insights',
        'Company Culture',
        'Interview Process',
        'Role Requirements'
      ]
    : [
        'Career Advice',
        'Skill Development',
        'Industry Trends',
        'Professional Growth',
        'Experience Sharing'
      ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            Request Coffee Chat
          </DialogTitle>
          <DialogDescription>
            Send a coffee chat request to connect and network professionally
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Person Info */}
          <Card className="p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-[#ff6b35] text-white">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{person.name}</h3>
                  {person.type === 'recruiter' ? (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Recruiter</Badge>
                  ) : (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                  {person.title && (
                    <>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {person.title}
                      </span>
                      {person.company && <span>•</span>}
                    </>
                  )}
                  {person.company && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {person.company}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {person.location}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                  {person.type === 'recruiter' ? (
                    <span className="text-blue-600 font-medium">
                      {person.hires} recent hires
                    </span>
                  ) : (
                    <span className="text-[#ff6b35] font-medium">
                      Rank #{person.rank} • Score: {person.score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Meeting Type */}
          <div>
            <Label className="mb-3 block">Meeting Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant={requestData.meetingType === 'virtual' ? 'default' : 'outline'}
                onClick={() => setRequestData(prev => ({ ...prev, meetingType: 'virtual' }))}
                className={`justify-start h-auto p-4 ${
                  requestData.meetingType === 'virtual' 
                    ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' 
                    : ''
                }`}
              >
                <Video className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Virtual Meeting</div>
                  <div className="text-xs opacity-80">Video call or phone</div>
                </div>
              </Button>
              
              <Button
                variant={requestData.meetingType === 'in-person' ? 'default' : 'outline'}
                onClick={() => setRequestData(prev => ({ ...prev, meetingType: 'in-person' }))}
                className={`justify-start h-auto p-4 ${
                  requestData.meetingType === 'in-person' 
                    ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' 
                    : ''
                }`}
              >
                <Coffee className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">In-Person</div>
                  <div className="text-xs opacity-80">Coffee shop or office</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={requestData.preferredDate}
                onChange={(e) => setRequestData(prev => ({ ...prev, preferredDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Preferred Time</Label>
              <Input
                type="time"
                value={requestData.preferredTime}
                onChange={(e) => setRequestData(prev => ({ ...prev, preferredTime: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <Select 
              value={requestData.duration} 
              onValueChange={(value: any) => setRequestData(prev => ({ ...prev, duration: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location/Platform specific fields */}
          {requestData.meetingType === 'in-person' && (
            <div>
              <Label>Suggested Location</Label>
              <Input
                placeholder="Coffee shop, restaurant, or office location..."
                value={requestData.location}
                onChange={(e) => setRequestData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>
          )}

          {requestData.meetingType === 'virtual' && (
            <div className="space-y-4">
              <div>
                <Label>Preferred Platform</Label>
                <Select 
                  value={requestData.meetingPlatform} 
                  onValueChange={(value: any) => setRequestData(prev => ({ ...prev, meetingPlatform: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="custom">Custom Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {requestData.meetingPlatform === 'custom' && (
                <div>
                  <Label>Meeting Link</Label>
                  <Input
                    placeholder="https://..."
                    value={requestData.customLink}
                    onChange={(e) => setRequestData(prev => ({ ...prev, customLink: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Topic */}
          <div>
            <Label>Discussion Topic (Optional)</Label>
            <Select 
              value={requestData.topic} 
              onValueChange={(value: any) => setRequestData(prev => ({ ...prev, topic: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a topic or leave blank for general chat" />
              </SelectTrigger>
              <SelectContent>
                {suggestedTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personal Message */}
          <div>
            <Label>Personal Message</Label>
            <Textarea
              placeholder={`Hi ${person.name.split(' ')[0]}, I'd love to connect and chat about ${
                person.type === 'recruiter' 
                  ? 'potential opportunities and learn more about your company...' 
                  : 'your career journey and get some insights about the industry...'
              }`}
              value={requestData.message}
              onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="mt-1"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
              <span className="text-xs text-gray-500">
                {requestData.message.length}/500 characters
              </span>
              <span className="text-xs text-gray-500">
                Be genuine and specific about why you'd like to connect
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Coffee chat request sent successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={!requestData.message.trim() || !requestData.preferredDate || !requestData.preferredTime || isSubmitting || isSuccess}
              className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}