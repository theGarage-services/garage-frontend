import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Search,
  Users,
  TrendingUp,
  Eye,
  MessageCircle,
  Star,
  MapPin,
  Briefcase,
  Clock,
  Zap,
  BarChart3,
  Activity,
  ChevronRight,
  Database,
  Rocket,
  Layers} from 'lucide-react';
import { queueService } from '../../api/queueService';

interface QueueSourcingPageProps {
  onBack: () => void;
  user: any;
  onViewCandidate?: (candidate: any) => void;
  onMessageCandidate?: (candidate: any) => void;
}

interface SourcingQueue {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  totalCandidates: number;
  activeCandidates: number;
  avgExperience: number;
  avgRating: number;
  topSkills: string[];
  salaryRange: string;
  locations: string[];
  growthRate: number;
  lastUpdated: string;
  weeklyGrowth: number;
  topCandidates: Array<{
    id: string;
    name: string;
    avatar: string;
    rating: number;
    experience: string;
    location: string;
    skills: string[];
    match: number;
    salary: string;
    lastActive: string;
  }>;
}

export function QueueSourcingPage({ onBack, onViewCandidate, onMessageCandidate }: Readonly<QueueSourcingPageProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQueue, setFilterQueue] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [jobSeekerQueues, setJobSeekerQueues] = useState<SourcingQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available buckets (industry/level groups) from backend
  useEffect(() => {
    const fetchBuckets = async () => {
      setIsLoading(true);
      try {
        const buckets = await queueService.getAvailableBuckets();
        // Transform buckets to SourcingQueue format
        const sourcingQueues: SourcingQueue[] = buckets.map(b => ({
          id: `${b.industry}-${b.level}`,
          name: `${b.industry} (${b.level})`,
          description: `${b.industry} specialists at ${b.level} level`,
          icon: Database, // Default icon - could be mapped from industry
          color: 'from-blue-500 to-blue-600',
          totalCandidates: b.candidate_count,
          activeCandidates: Math.floor(b.candidate_count * 0.7), // Estimate
          avgExperience: 0,
          avgRating: 0,
          topSkills: [],
          salaryRange: 'TBD',
          locations: [],
          growthRate: 0,
          lastUpdated: 'Recently',
          weeklyGrowth: 0,
          topCandidates: []
        }));
        setJobSeekerQueues(sourcingQueues);
      } catch (error) {
        console.error('Failed to fetch buckets:', error);
        setJobSeekerQueues([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuckets();
  }, []);

  // Use API data from backend
  const queues = jobSeekerQueues;

  const filteredQueues = queues.filter(queue => {
    const matchesSearch = queue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         queue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         queue.topSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterQueue === 'all' || queue.id === filterQueue;
    return matchesSearch && matchesFilter;
  });

  const totalCandidates = queues.reduce((sum, queue) => sum + queue.totalCandidates, 0);
  const totalActive = queues.reduce((sum, queue) => sum + queue.activeCandidates, 0);
  const avgGrowthRate = queues.length > 0 ? queues.reduce((sum, queue) => sum + queue.growthRate, 0) / queues.length : 0;

  const locations = Array.from(new Set(queues.flatMap(queue => queue.locations)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-gray-600 hover:text-[#ff6b35]"
            >
              ← Back to Candidates
            </Button>
            <h1 className="text-3xl text-gray-900 mb-2">Queue Sourcing</h1>
            <p className="text-gray-600">
              Access theGarage job seeker queues and discover top talent
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
            <span className="ml-3 text-gray-600">Loading sourcing data...</span>
          </div>
        ) : (
        <>
        {/* Overall Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl mb-1 text-gray-900">{totalCandidates.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl mb-1 text-gray-900">{totalActive.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Active Candidates</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white to-purple-50 border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl mb-1 text-gray-900">{avgGrowthRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Growth Rate</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white to-orange-50 border-0 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Live</Badge>
            </div>
            <div className="text-2xl mb-1 text-gray-900">{jobSeekerQueues.length}</div>
            <div className="text-sm text-gray-600">Active Queues</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:flex-1">
              <div className="relative flex-1 max-w-[95vw] sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search queues, skills, or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterQueue} onValueChange={setFilterQueue}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by queue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Queues</SelectItem>
                  {jobSeekerQueues.map(queue => (
                    <SelectItem key={queue.id} value={queue.id}>{queue.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredQueues.length} queue{filteredQueues.length === 1 ? '' : 's'} found
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="overview">Queue Overview</TabsTrigger>
            <TabsTrigger value="candidates">Top Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {filteredQueues.map((queue) => {
                const IconComponent = queue.icon;
                return (
                  <Card key={queue.id} className="p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
                        <div className={`w-16 h-16 bg-gradient-to-r ${queue.color} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl text-gray-900">{queue.name}</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {queue.activeCandidates} active
                            </Badge>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">+{queue.growthRate}%</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{queue.description}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-2xl text-gray-900 mb-1">
                                {queue.totalCandidates.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Total Candidates</div>
                              <div className="text-xs text-green-600 mt-1">+{queue.weeklyGrowth} this week</div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-2xl text-gray-900">{queue.avgRating}</span>
                              </div>
                              <div className="text-sm text-gray-600">Avg Rating</div>
                              <div className="text-xs text-gray-500 mt-1">{queue.avgExperience} years exp</div>
                            </div>
                            
                            <div>
                              <div className="text-2xl text-gray-900 mb-1">{queue.salaryRange}</div>
                              <div className="text-sm text-gray-600">Salary Range</div>
                              <div className="text-xs text-gray-500 mt-1">CAD annually</div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-gray-600 mb-2">Top Skills:</div>
                              <div className="flex flex-wrap gap-2">
                                {queue.topSkills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-600 mb-2">Locations:</div>
                              <div className="flex flex-wrap gap-2">
                                {queue.locations.slice(0, 4).map((location) => (
                                  <Badge key={location} variant="outline" className="text-xs">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {location}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 self-start lg:self-auto">
                        <Button
                          size="sm"
                          className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                          onClick={() => onViewCandidate?.(queue)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Candidates
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Last updated {queue.lastUpdated}
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {queue.activeCandidates} active
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            {queue.growthRate}% growth
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <div className="space-y-4">
              {filteredQueues.map((queue) => (
                <Card key={queue.id} className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-8 h-8 bg-gradient-to-r ${queue.color} rounded-lg flex items-center justify-center`}>
                      <queue.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900">{queue.name} - Top Candidates</h3>
                    <Badge variant="secondary">{queue.topCandidates.length} shown</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {queue.topCandidates.map((candidate) => (
                      <div key={candidate.id} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <Avatar className="w-12 h-12 shrink-0">
                              <AvatarFallback className="bg-[#ff6b35] text-white">
                                {candidate.avatar}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h4 className="text-gray-900">{candidate.name}</h4>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600">{candidate.rating}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  {candidate.match}% match
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {candidate.experience}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {candidate.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Active {candidate.lastActive}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2">
                                {candidate.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end gap-3 self-start sm:self-auto">
                            <div className="text-right">
                              <div className="text-lg text-gray-900">{candidate.salary}</div>
                              <div className="text-xs text-gray-500">Expected</div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => onViewCandidate?.(candidate)}
                                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onMessageCandidate?.(candidate)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                        onClick={() => onViewCandidate?.(queue)}
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        View All {queue.activeCandidates} Candidates
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </div>
  );
}