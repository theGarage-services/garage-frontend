import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  Star,
  Quote,
  Award,
  Rocket,
  Play,
  Filter
} from 'lucide-react';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';

interface SuccessStoriesProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export function SuccessStories({ onBack, onNavigate, user, onLogout }: Readonly<SuccessStoriesProps>) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const successStories = [
    {
      id: 1,
      type: 'job-seeker',
      name: 'Sarah Chen',
      title: 'From Bootcamp Graduate to Senior Developer',
      previousRole: 'Marketing Coordinator',
      newRole: 'Senior Full Stack Developer',
      company: 'TechFlow Solutions',
      salaryIncrease: 85,
      timeToHire: 12,
      location: 'Toronto, ON',
      story: 'After completing a coding bootcamp, I was overwhelmed by the job search process. theGarage\'s dual-perspective approach helped me understand what recruiters were looking for and connected me directly with hiring managers.',
      quote: 'theGarage didn\'t just help me find a job – it helped me find my dream career. The direct recruiter connections made all the difference.',
      avatar: 'SC',
      rating: 5,
      featured: true,
      tags: ['Career Change', 'Technology', 'Bootcamp']
    },
    {
      id: 2,
      type: 'recruiter',
      name: 'Marcus Rodriguez',
      title: 'DataCorp Solutions',
      role: 'Senior Technical Recruiter',
      achievement: 'Reduced time-to-hire by 60%',
      hiresMade: 47,
      timeReduction: 60,
      costSaving: 125000,
      story: 'Our traditional recruiting process was taking 45+ days per hire. With theGarage\'s queue system and direct candidate access, we\'ve transformed our entire hiring pipeline.',
      quote: 'The quality of candidates and the speed of connections has revolutionized how we hire. Our hiring managers are consistently impressed.',
      avatar: 'MR',
      rating: 5,
      featured: true,
      tags: ['Efficiency', 'Cost Reduction', 'Technology']
    },
    {
      id: 3,
      type: 'job-seeker',
      name: 'Elena Kowalski',
      title: 'International Professional Finds Home',
      previousRole: 'Senior Analyst (Poland)',
      newRole: 'Lead Data Scientist',
      company: 'Canadian Analytics Inc',
      salaryIncrease: 120,
      timeToHire: 8,
      location: 'Vancouver, BC',
      story: 'Moving to Canada was challenging, but theGarage made the job search feel personal. Recruiters could see my international experience and skills, not just my lack of Canadian experience.',
      quote: 'I finally found a platform that valued my global perspective. The recruiter who hired me saw my potential, not just my geography.',
      avatar: 'EK',
      rating: 5,
      featured: false,
      tags: ['International', 'Data Science', 'Immigration']
    },
    {
      id: 4,
      type: 'company',
      name: 'StartupXYZ',
      title: 'Fast-Growing Startup Scales Team',
      industry: 'FinTech',
      teamSize: 'Grew from 12 to 45 employees',
      timeframe: '6 months',
      hiresMade: 33,
      averageTime: 14,
      retention: 94,
      story: 'As a fast-growing startup, we needed to hire quickly without compromising quality. theGarage\'s platform gave us access to pre-qualified candidates who were genuinely interested in startup culture.',
      quote: 'We went from struggling to find good candidates to having our pick of incredible talent. Our team loves the people we\'ve hired through theGarage.',
      avatar: 'SX',
      rating: 5,
      featured: false,
      tags: ['Startup', 'Scaling', 'FinTech']
    },
    {
      id: 5,
      type: 'job-seeker',
      name: 'David Kim',
      title: 'Senior Professional Returns to Workforce',
      previousRole: 'Career Break (2 years)',
      newRole: 'Product Manager',
      company: 'Innovation Labs',
      salaryIncrease: 15,
      timeToHire: 18,
      location: 'Montreal, QC',
      story: 'After taking time off to care for family, I was worried about explaining the gap in my resume. theGarage\'s platform let me showcase my skills and projects, and recruiters understood my value.',
      quote: 'I was nervous about returning to work, but theGarage gave me confidence. The recruiter focused on what I could do, not the gap in my resume.',
      avatar: 'DK',
      rating: 5,
      featured: false,
      tags: ['Career Gap', 'Return to Work', 'Product Management']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Stories', count: successStories.length },
    { id: 'job-seeker', label: 'Job Seekers', count: successStories.filter(s => s.type === 'job-seeker').length },
    { id: 'recruiter', label: 'Recruiters', count: successStories.filter(s => s.type === 'recruiter').length },
    { id: 'company', label: 'Companies', count: successStories.filter(s => s.type === 'company').length }
  ];

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.type === selectedCategory);

  const featuredStory = successStories.find(story => story.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-medium text-gray-900">Success Stories</span>
                </div>
              </div>
            </div>

            <RecruiterProfileDropdown 
              onNavigate={onNavigate}
              onLogout={onLogout}
              user={user}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Real Success Stories</h1>
          <p className="text-gray-600 max-w-[95vw] sm:max-w-2xl mx-auto">
            Discover how theGarage has transformed careers and revolutionized hiring for thousands of users across Canada
          </p>
        </div>

        {/* Featured Story */}
        {featuredStory && (
          <Card className="p-8 mb-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-medium">Featured Success Story</span>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-medium text-xl">
                      {featuredStory.avatar}
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium">{featuredStory.name}</h3>
                      <p className="text-white/90">{featuredStory.title}</p>
                    </div>
                  </div>
                  
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-white/40 absolute -top-2 -left-2" />
                    <blockquote className="text-lg italic pl-6">
                      "{featuredStory.quote}"
                    </blockquote>
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  {featuredStory.type === 'job-seeker' && (
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-3xl font-medium mb-1">+{featuredStory.salaryIncrease}%</div>
                        <div className="text-white/90 text-sm">Salary Increase</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-3xl font-medium mb-1">{featuredStory.timeToHire} days</div>
                        <div className="text-white/90 text-sm">Time to Hire</div>
                      </div>
                    </div>
                  )}
                  {featuredStory.type === 'recruiter' && (
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-3xl font-medium mb-1">{featuredStory.hiresMade}</div>
                        <div className="text-white/90 text-sm">Successful Hires</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-3xl font-medium mb-1">-{featuredStory.timeReduction}%</div>
                        <div className="text-white/90 text-sm">Time Reduction</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
              >
                {category.label} ({category.count})
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Success Stories Grid */}
        <div className="grid gap-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center text-white font-medium text-xl flex-shrink-0">
                  {story.avatar}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-1">{story.name}</h3>
                      <p className="text-gray-600 mb-2">{story.title}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {story.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: story.rating }).map((_, i) => (
                        <Star key={`${story.id}-star-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{story.story}</p>
                  
                  <div className="relative mb-4">
                    <Quote className="w-6 h-6 text-[#ff6b35]/30 absolute -top-1 -left-1" />
                    <blockquote className="text-[#ff6b35] italic pl-5 font-medium">
                      "{story.quote}"
                    </blockquote>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-4">
                    {story.type === 'job-seeker' && (
                      <>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">+{story.salaryIncrease}%</div>
                          <div className="text-xs text-gray-600">Salary Increase</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.timeToHire} days</div>
                          <div className="text-xs text-gray-600">Time to Hire</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.company}</div>
                          <div className="text-xs text-gray-600">New Company</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.location}</div>
                          <div className="text-xs text-gray-600">Location</div>
                        </div>
                      </>
                    )}
                    
                    {story.type === 'recruiter' && (
                      <>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.hiresMade}</div>
                          <div className="text-xs text-gray-600">Hires Made</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">-{story.timeReduction}%</div>
                          <div className="text-xs text-gray-600">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">${(story.costSaving ? story.costSaving / 1000 : 0)}K</div>
                          <div className="text-xs text-gray-600">Cost Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.role}</div>
                          <div className="text-xs text-gray-600">Position</div>
                        </div>
                      </>
                    )}
                    
                    {story.type === 'company' && (
                      <>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.hiresMade}</div>
                          <div className="text-xs text-gray-600">Team Members</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.averageTime} days</div>
                          <div className="text-xs text-gray-600">Avg Hire Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.retention}%</div>
                          <div className="text-xs text-gray-600">Retention Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{story.timeframe}</div>
                          <div className="text-xs text-gray-600">Timeframe</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="p-8 mt-8 bg-gradient-to-r from-gray-50 to-orange-50 border-orange-200 text-center">
          <h3 className="text-2xl font-medium text-gray-900 mb-4">Ready to Write Your Success Story?</h3>
          <p className="text-gray-600 mb-6 max-w-[95vw] sm:max-w-2xl mx-auto">
            Join thousands of successful job seekers and recruiters who have transformed their careers with theGarage's dual-perspective platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              <Rocket className="w-4 h-4 mr-2" />
              Start Your Journey
            </Button>
            <Button variant="outline" className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white">
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}