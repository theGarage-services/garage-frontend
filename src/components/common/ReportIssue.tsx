import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowLeft, Bug, AlertTriangle, Shield, Upload, Send, CheckCircle, Camera, Smartphone } from 'lucide-react';

interface ReportIssueProps {
  onBack: () => void;
}

export function ReportIssue({ onBack }: Readonly<ReportIssueProps>) {
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [browser, setBrowser] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const formProgress = () => {
    const requiredFields = [issueType, severity, title, description];
    const filledFields = requiredFields.filter(field => field.trim() !== '').length;
    return (filledFields / requiredFields.length) * 100;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!issueType || !severity || !title || !description) {
      return;
    }

    // Generate cryptographically secure submission ID
    const cryptoValues = new Uint32Array(3);
    crypto.getRandomValues(cryptoValues);
    const randomString = Array.from(cryptoValues)
      .map(val => val.toString(36))
      .join('')
      .toUpperCase()
      .slice(0, 9);
    const id = 'RPT-' + randomString;
    setSubmissionId(id);

    // In a real app, this would submit the report
    // Remove console.log for production
    // console.log('Bug report submitted:', {
    //   issueType,
    //   severity,
    //   title,
    //   description,
    //   stepsToReproduce,
    //   expectedBehavior,
    //   actualBehavior,
    //   browser,
    //   operatingSystem,
    //   includeSystemInfo,
    //   includeLogs,
    //   attachments: attachments.map(f => f.name)
    // });

    setSubmitted(true);
  };

  const resetForm = () => {
    setIssueType('');
    setSeverity('');
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
    setBrowser('');
    setOperatingSystem('');
    setAttachments([]);
    setSubmitted(false);
    setSubmissionId('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-[95vw] sm:max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-green-900 mb-2">Report Submitted Successfully!</h1>
              <p className="text-green-800 mb-4">
                Thank you for helping us improve theGarage. We've received your report and will investigate it promptly.
              </p>
              
              <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Report ID:</span>
                  <Badge className="bg-green-100 text-green-800 font-mono">{submissionId}</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Save this ID for reference. We'll send updates to your email.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Report Another Issue
                </Button>
                <Button 
                  onClick={onBack}
                  className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
                >
                  Return to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-[95vw] sm:max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-gray-600">Help us improve theGarage by reporting bugs or issues</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm text-gray-500">{Math.round(formProgress())}% complete</span>
            </div>
            <Progress value={formProgress()} className="h-2" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Issue Type & Severity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-[#ff6b35]" />
                Issue Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type *</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">🐛 Bug Report</SelectItem>
                      <SelectItem value="ui">🎨 UI/UX Issue</SelectItem>
                      <SelectItem value="performance">⚡ Performance Issue</SelectItem>
                      <SelectItem value="security">🔒 Security Concern</SelectItem>
                      <SelectItem value="feature">💡 Feature Request</SelectItem>
                      <SelectItem value="data">📊 Data Issue</SelectItem>
                      <SelectItem value="accessibility">♿ Accessibility Issue</SelectItem>
                      <SelectItem value="other">❓ Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Critical - App unusable</SelectItem>
                      <SelectItem value="high">🟡 High - Major functionality broken</SelectItem>
                      <SelectItem value="medium">🟢 Medium - Minor functionality issue</SelectItem>
                      <SelectItem value="low">🔵 Low - Cosmetic or enhancement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ff6b35]" />
                Issue Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. What happened? What were you trying to do?"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  placeholder="1. Go to... 
2. Click on...
3. See error..."
                  rows={4}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expected">Expected Behavior</Label>
                  <Textarea
                    id="expected"
                    placeholder="What should have happened?"
                    rows={3}
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actual">Actual Behavior</Label>
                  <Textarea
                    id="actual"
                    placeholder="What actually happened?"
                    rows={3}
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#ff6b35]" />
                Environment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browser">Browser</Label>
                  <Select value={browser} onValueChange={setBrowser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select browser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Microsoft Edge</SelectItem>
                      <SelectItem value="opera">Opera</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="os">Operating System</Label>
                  <Select value={operatingSystem} onValueChange={setOperatingSystem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="system-info" 
                    checked={includeSystemInfo}
                    onCheckedChange={(checked) => setIncludeSystemInfo(checked === true)}
                  />
                  <Label htmlFor="system-info" className="text-sm">
                    Include system information (browser version, screen resolution, etc.)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logs" 
                    checked={includeLogs}
                    onCheckedChange={(checked) => setIncludeLogs(checked === true)}
                  />
                  <Label htmlFor="logs" className="text-sm">
                    Include console logs and error details
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#ff6b35]" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload screenshots, videos, or other files that help explain the issue
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Max 5 files, 10MB each. Supports images, videos, PDFs, and text files.
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Attached Files:</h4>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ready to submit your report?</p>
                  <p className="text-sm text-gray-600">We'll investigate and get back to you within 48 hours.</p>
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={!issueType || !severity || !title || !description}
                  className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Privacy & Security</h4>
                  <p className="text-sm text-blue-800">
                    Your report will only be seen by our technical team. We never share bug reports publicly or use them for marketing purposes. 
                    System information helps us diagnose issues faster but can be excluded if preferred.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}