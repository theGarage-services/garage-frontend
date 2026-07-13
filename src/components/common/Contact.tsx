import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, MessageCircle, Phone, Mail, Send, CheckCircle, Clock, Target, Menu, X } from 'lucide-react';
import { Footer } from '../layout/Footer';

interface ContactProps {
  onBack?: () => void;
}

export function Contact({ onBack }: Readonly<ContactProps>) {
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactType, setContactType] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleContactSubmit = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    
    // In a real app, this would send the message
    console.log('Support ticket submitted:', { contactType, contactSubject, contactMessage });
    setSubmitted(true);
    setContactSubject('');
    setContactMessage('');
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F7] via-[#FFF5F2] to-[#FBF9F7] text-[#1A1A1A]">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF6000]/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#469AF9]/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Fixed Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E8E5E2]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF6000] to-[#FF8533] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-medium">
                <span className="text-[#1A1A1A]">the</span>
                <span className="text-[#FF6000]">Garage</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => globalThis.location.href = '/'}
                className="text-[#9E9B98] hover:text-[#1A1A1A] transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => globalThis.location.href = '/about'}
                className="text-[#9E9B98] hover:text-[#1A1A1A] transition-colors"
              >
                About
              </button>
              <Button 
                onClick={() => globalThis.location.href = '/auth/role-select?role=job-seeker&intent=login'}
                className="bg-gradient-to-r from-[#FF6000] to-[#FF8533] hover:from-[#FF7A1F] hover:to-[#FF9D4D] text-white"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-[#9E9B98] hover:text-[#1A1A1A]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#E8E5E2]">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    globalThis.location.href = '/';
                  }}
                  className="text-[#9E9B98] hover:text-[#1A1A1A] transition-colors text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    globalThis.location.href = '/about';
                  }}
                  className="text-[#9E9B98] hover:text-[#1A1A1A] transition-colors text-left"
                >
                  About
                </button>
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    globalThis.location.href = '/auth/role-select?role=job-seeker&intent=login';
                  }}
                  className="bg-gradient-to-r from-[#FF6000] to-[#FF8533] hover:from-[#FF7A1F] hover:to-[#FF9D4D] text-white"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
            <p className="text-gray-600">Get in touch with our support team</p>
          </div>
        </div>

        {submitted && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your message has been sent! We'll get back to you within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#ff6b35]" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-type">Type of Issue</Label>
                <select 
                  id="contact-type"
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Support</option>
                  <option value="account">Account Help</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleContactSubmit}
                disabled={!contactSubject.trim() || !contactMessage.trim()}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Options */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#ff6b35]" />
                  Other Ways to Reach Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@thegarage.jobs</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-GARAGE</p>
                    <p className="text-xs text-gray-500">Premium users only</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#ff6b35]" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600">General Inquiries</span>
                  <Badge variant="outline" className="self-start sm:self-auto">24 hours</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600">Technical Issues</span>
                  <Badge variant="outline" className="self-start sm:self-auto">12 hours</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600">Billing Support</span>
                  <Badge variant="outline" className="self-start sm:self-auto">8 hours</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm text-gray-600">Premium Support</span>
                  <Badge className="bg-[#ff6b35] text-white self-start sm:self-auto">2 hours</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
