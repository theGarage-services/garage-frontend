import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Search, HelpCircle, Zap, Users, Lightbulb, Target, Menu, X } from 'lucide-react';
import { Footer } from '../layout/Footer';

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const faqData = [
    {
      question: "How do I apply to jobs on theGarage?",
      answer: "You can apply to jobs in several ways: 1) Use Quick Apply for instant applications, 2) Apply manually through company websites, or 3) Get automatically considered by recruiters through our queue system. All applied jobs will appear in your Job Tracker."
    },
    {
      question: "What is the difference between manual apply and quick apply?",
      answer: "Quick Apply instantly submits your profile to employers with one click. Manual Apply redirects you to the company's website where you can customize your application. Both methods automatically add the job to your tracker."
    },
    {
      question: "How does the queue system work?",
      answer: "Our AI-powered queue system matches you with relevant jobs based on your profile, skills, and preferences. You can join up to 5 queues total (3 manual + 2 AI-selected). Premium users get advanced analytics and priority placement."
    },
    {
      question: "What's included in the Premium plan?",
      answer: "Premium includes: Direct messaging with recruiters, priority application status, advanced queue analytics, Live Profile Upgrade Checker, Queue Leaderboards, interview scheduling, and unlimited job applications. It's $19.99/month with a 7-day free trial."
    },
    {
      question: "How do I track my job applications?",
      answer: "All your applications automatically appear in the Job Tracker with stages: Application Received, Under Consideration, Interview Stage, Offer, or Rejected. You can add notes and see recruiter feedback for each application."
    },
    {
      question: "Can I withdraw my job applications?",
      answer: "Yes, you can withdraw applications directly from the job details page or your Job Tracker. This will remove you from consideration and update your application status."
    },
    {
      question: "How do I chat with recruiters?",
      answer: "Recruiter chat is available for Premium users only. Once you apply to a job, you'll see a chat option in the job details if the recruiter has enabled it. You can schedule interviews and communicate directly."
    },
    {
      question: "What should I include in my profile?",
      answer: "Complete profiles get better matches! Include: Professional summary, work experience, skills, education, certifications, and career preferences. Use our Resume Editor to keep everything up-to-date."
    },
    {
      question: "How do notifications work?",
      answer: "You'll receive notifications for: Application status changes, new job matches, recruiter messages, interview reminders, and queue updates. Customize notification preferences in Account Settings."
    },
    {
      question: "Is my data secure on theGarage?",
      answer: "Absolutely! We use enterprise-grade security, encrypt all data, and never share personal information without consent. You control your profile visibility and can export or delete your data anytime."
    }
  ];

  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about theGarage</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#ff6b35]" />
              Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.question} value={item.question} className="border border-gray-200 rounded-lg px-4">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
              <p className="text-sm text-blue-700 mb-3">New to theGarage? Learn the basics</p>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Job Applications</h3>
              <p className="text-sm text-green-700 mb-3">Learn how to apply and track jobs</p>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Premium Features</h3>
              <p className="text-sm text-purple-700 mb-3">Unlock advanced capabilities</p>
              <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
