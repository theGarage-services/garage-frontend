import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft,
  Users, 
  UserCheck,
  Target,
  CheckCircle,
  Activity,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Layers,
  GitBranch,
  Split
} from 'lucide-react';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';

interface DualPerspectiveDemoProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export function DualPerspectiveDemo({ onBack, onNavigate, user, onLogout }: Readonly<DualPerspectiveDemoProps>) {
  const [activeDemo, setActiveDemo] = useState('side-by-side');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Demo scenarios showing the same interaction from both perspectives
  const demoScenarios = [
    {
      title: 'Job Application Process',
      jobSeekerView: {
        title: 'Finding the Perfect Role',
        steps: [
          'Browse available jobs on theGarage homepage',
          'Discover "Senior Developer" role at TechCorp',
          'Click "Quick Apply" to submit application',
          'Job automatically added to tracker',
          'Receive notification: "Application received"'
        ],
        benefits: ['One-click application', 'Real-time tracking', 'Direct recruiter connection']
      },
      recruiterView: {
        title: 'Receiving Quality Applications',
        steps: [
          'Candidate applies through theGarage platform',
          'Application appears in candidate dashboard',
          'AI matching score: 95% compatibility',
          'Review candidate profile and queue ranking', 
          'Send direct message to candidate'
        ],
        benefits: ['Pre-qualified candidates', 'AI-powered matching', 'Streamlined review process']
      }
    },
    {
      title: 'Queue Discovery System',
      jobSeekerView: {
        title: 'Getting Discovered',
        steps: [
          'Join "Senior Software Engineer" queue',
          'Profile automatically ranked by AI',
          'Receive queue position: #12 out of 1,847',
          'Get discovered by TechCorp recruiter',
          'Receive message: "Perfect match for our role!"'
        ],
        benefits: ['Passive job discovery', 'Skill-based ranking', 'Direct recruiter reach-out']
      },
      recruiterView: {
        title: 'Finding Top Talent',
        steps: [
          'Access "Senior Software Engineer" queue',
          'Browse 1,847 pre-qualified candidates',
          'Filter by React, TypeScript, 5+ years exp',
          'Identify top-ranked candidate (95% match)',
          'Send direct consideration message'
        ],
        benefits: ['Access to passive candidates', 'Advanced filtering', 'Higher quality matches']
      }
    },
    {
      title: 'Interview Scheduling',
      jobSeekerView: {
        title: 'Seamless Interview Coordination',
        steps: [
          'Receive interview request from recruiter',
          'View available time slots in calendar',
          'Select preferred time: "Tomorrow 2 PM"',
          'Receive calendar invite automatically',
          'Get interview details and preparation tips'
        ],
        benefits: ['Easy scheduling', 'Calendar integration', 'Interview preparation']
      },
      recruiterView: {
        title: 'Efficient Interview Management',
        steps: [
          'Select candidate for interview',
          'Open integrated scheduling system',
          'Propose multiple time slots',
          'Candidate confirms preferred time',
          'Interview automatically added to calendar'
        ],
        benefits: ['Integrated scheduling', 'Automated calendar sync', 'Reduced back-and-forth']
      }
    }
  ];

  const currentScenario = demoScenarios[currentStep] || demoScenarios[0];

  const toggleDemo = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Start demo animation
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= demoScenarios.length - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 4000);
    }
  };

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
                    <Split className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-medium text-gray-900">Dual-Perspective Demo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDemo}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  {isPlaying ? 'Pause Demo' : 'Start Demo'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              
              <RecruiterProfileDropdown 
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Experience <span className="text-black">the</span><span className="text-[#ff6b35]">Garage</span> from Both Sides
          </h1>
          <p className="text-gray-600 max-w-[95vw] sm:max-w-3xl mx-auto">
            See how theGarage creates seamless connections between job seekers and recruiters through our dual-perspective platform. 
            Every interaction is designed to benefit both sides of the hiring process.
          </p>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="side-by-side" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Side by Side
              </TabsTrigger>
              <TabsTrigger value="interactive" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Interactive
              </TabsTrigger>
              <TabsTrigger value="animated" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Animated Flow
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="side-by-side" className="space-y-8">
            {/* Current Scenario Display */}
            <Card className="p-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white text-center">
              <h2 className="text-2xl font-medium mb-2">{currentScenario.title}</h2>
              <p className="text-white/90">Step {currentStep + 1} of {demoScenarios.length}</p>
              <div className="flex justify-center mt-4 gap-2">
                {demoScenarios.map((scenario, index) => (
                  <div
                    key={scenario.title}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </Card>

            {/* Side by Side Comparison */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Job Seeker Perspective */}
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">Job Seeker Experience</h3>
                    <p className="text-blue-700">{currentScenario.jobSeekerView.title}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {currentScenario.jobSeekerView.steps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 flex-1">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Benefits:</h4>
                  {currentScenario.jobSeekerView.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recruiter Perspective */}
              <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">Recruiter Experience</h3>
                    <p className="text-[#ff6b35]">{currentScenario.recruiterView.title}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {currentScenario.recruiterView.steps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 flex-1">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Benefits:</h4>
                  {currentScenario.recruiterView.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous Scenario
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(demoScenarios.length - 1, currentStep + 1))}
                disabled={currentStep === demoScenarios.length - 1}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
              >
                Next Scenario
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="space-y-8">
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Interactive Demo</h3>
              <p className="text-gray-600 mb-6">Click through real theGarage interfaces to experience both perspectives</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience as Job Seeker</h4>
                  <p className="text-gray-600 text-sm mb-4">Browse jobs, join queues, track applications</p>
                  <Button 
                    onClick={() => onNavigate('homepage')}
                    variant="outline" 
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Try Job Seeker View
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience as Recruiter</h4>
                  <p className="text-gray-600 text-sm mb-4">Manage candidates, post jobs, access queues</p>
                  <Button 
                    onClick={() => onNavigate('homepage')}
                    variant="outline" 
                    className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
                  >
                    Try Recruiter View
                  </Button>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="animated" className="space-y-8">
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Animated Platform Flow</h3>
              <p className="text-gray-600 mb-6">Watch how interactions flow seamlessly between job seekers and recruiters</p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button
                  onClick={toggleDemo}
                  className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-[#ff6b35] hover:bg-[#e55a2b]'} text-white`}
                >
                  {isPlaying ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause Animation' : 'Start Animation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Start
                </Button>
              </div>

              <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {isPlaying ? '🎬' : '🎯'}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {isPlaying ? 'Animation Playing...' : 'Ready to Start'}
                  </h4>
                  <p className="text-gray-600">
                    {isPlaying 
                      ? `Currently showing: ${currentScenario.title}`
                      : 'Click "Start Animation" to see the platform in action'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Platform Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">125K+</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">45K+</div>
            <div className="text-sm text-gray-600">Jobs Posted</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">12K+</div>
            <div className="text-sm text-gray-600">Successful Hires</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">4.8/5</div>
            <div className="text-sm text-gray-600">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}