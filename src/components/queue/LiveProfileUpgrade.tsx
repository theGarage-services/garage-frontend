import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Zap, GraduationCap, Award, Briefcase, Code, FileText, Users, Target, CheckCircle2 } from 'lucide-react';
import { useCareerSimulator } from '../../hooks/useCareerSimulator';
import { SimulationResultCard } from './SimulationResultCard';
import { getIndustryLabel } from './BucketManager';
import { careerSimulatorApi } from '../../api/careerSimulator';

interface LiveProfileUpgradeProps {
  userQueues?: string[];
  selectedBuckets?: Array<{ industry: string; level: string }>;
}

interface ProfileAddition {
  id: string;
  type: 'education' | 'certification' | 'skill' | 'experience' | 'project' | 'publication' | 'volunteer';
  data: any;
}

export function LiveProfileUpgrade({ userQueues = [], selectedBuckets = [] }: Readonly<LiveProfileUpgradeProps>) {
  const [additions, setAdditions] = useState<ProfileAddition[]>([]);
  const { result, loading, error, simulate } = useCareerSimulator();
  const [queueResults, setQueueResults] = useState<Record<string, any>>({});
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const firstQueueResult = Object.values(queueResults)[0] || null;

  // Use selectedBuckets if available, otherwise parse from userQueues
  const bucketsToSimulate = selectedBuckets.length > 0 
    ? selectedBuckets 
    : userQueues.map(q => {
        const lastDash = q.lastIndexOf('-');
        return {
          industry: q.slice(0, lastDash),
          level: q.slice(lastDash + 1)
        };
      }).filter(b => b.industry && b.level);

  const addItem = (type: ProfileAddition['type']) => {
    const newItem: ProfileAddition = {
      id: Date.now().toString(),
      type,
      data: getDefaultData(type)
    };
    setAdditions([...additions, newItem]);
  };

  const getDefaultData = (type: ProfileAddition['type']) => {
    switch (type) {
      case 'education':
        return { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', location: '' };
      case 'certification':
        return { name: '', issuer: '', date: '', expiryDate: '', credentialId: '' };
      case 'skill':
        return { name: '', category: '', level: 3 };
      case 'experience':
        return { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
      case 'project':
        return { name: '', description: '', technologies: '', startDate: '', endDate: '', url: '' };
      case 'publication':
        return { title: '', journal: '', date: '', authors: '', doi: '' };
      case 'volunteer':
        return { organization: '', role: '', startDate: '', endDate: '', description: '', location: '' };
      default:
        return {};
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setAdditions(additions.map(item => 
      item.id === id ? { ...item, data: { ...item.data, [field]: value } } : item
    ));
  };

  const removeItem = (id: string) => {
    setAdditions(additions.filter(item => item.id !== id));
  };

  const extractSkillTokens = useCallback((item: ProfileAddition): string[] => {
    const tokens: string[] = [];
    const pushIfString = (value: unknown) => {
      if (typeof value === 'string' && value.trim()) tokens.push(value.trim());
    };

    switch (item.type) {
      case 'skill':
      case 'certification':
        pushIfString(item.data.name);
        break;
      case 'project':
        if (item.data.technologies) {
          item.data.technologies
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
            .forEach((t: string) => pushIfString(t));
        }
        pushIfString(item.data.name);
        break;
      case 'experience':
        pushIfString(item.data.position);
        break;
      case 'education':
        pushIfString(item.data.field);
        break;
      case 'publication':
        pushIfString(item.data.title);
        break;
      case 'volunteer':
        pushIfString(item.data.role);
        break;
    }

    return tokens;
  }, []);

  const simulateProfileImprovements = async () => {
    // Convert the simulated additions into a list of hypothetical skills.
    // We deliberately keep this lightweight: skill/cert/project names and
    // experience titles are the strongest signal for the coverage model.
    const hypothetical_skills = additions.flatMap(extractSkillTokens);

    if (bucketsToSimulate.length === 0) {
      console.warn('No buckets to simulate');
      return;
    }

    try {
      // Simulate all buckets in parallel
      const simulationPromises = bucketsToSimulate.map(async (bucket) => {
        const queueKey = `${bucket.industry}-${bucket.level}`;
        try {
          const result = await simulate({
            target_industry: bucket.industry,
            target_level: bucket.level,
            hypothetical_skills,
          });
          return { queueKey, result };
        } catch (err) {
          console.error(`Simulation failed for ${queueKey}:`, err);
          return { queueKey, result: { success: false, error: 'Simulation failed' } };
        }
      });

      const results = await Promise.all(simulationPromises);
      
      // Convert array to object keyed by queue
      const resultsMap: Record<string, any> = {};
      results.forEach(({ queueKey, result }) => {
        resultsMap[queueKey] = result;
      });
      
      setQueueResults(resultsMap);
      setApplySuccess(false); // Reset apply success on new simulation
    } catch (err) {
      console.error('Profile improvement simulation failed:', err);
    }
  };

  const applySimulation = async () => {
    const hypothetical_skills = additions.flatMap(extractSkillTokens);
    
    if (bucketsToSimulate.length === 0) {
      console.warn('No buckets to apply simulation to');
      return;
    }

    setApplying(true);
    try {
      // Apply to the first bucket (primary target) - typically the user's main queue
      const primaryBucket = bucketsToSimulate[0];
      const result = await careerSimulatorApi.applySimulation({
        target_industry: primaryBucket.industry,
        target_level: primaryBucket.level,
        hypothetical_skills,
      });
      
      if (result.success) {
        setApplySuccess(true);
        // Refresh the simulation results to show the applied state
        await simulateProfileImprovements();
      }
    } catch (err) {
      console.error('Failed to apply simulation:', err);
    } finally {
      setApplying(false);
    }
  };

  const getTypeIcon = (type: ProfileAddition['type']) => {
    switch (type) {
      case 'education': return GraduationCap;
      case 'certification': return Award;
      case 'experience': return Briefcase;
      case 'skill': return Code;
      case 'project': return FileText;
      case 'publication': return FileText;
      case 'volunteer': return Users;
      default: return Plus;
    }
  };

  const getTypeColor = (type: ProfileAddition['type']) => {
    switch (type) {
      case 'education': return 'from-blue-500 to-blue-600';
      case 'certification': return 'from-orange-500 to-orange-600';
      case 'experience': return 'from-green-500 to-green-600';
      case 'skill': return 'from-purple-500 to-purple-600';
      case 'project': return 'from-pink-500 to-pink-600';
      case 'publication': return 'from-indigo-500 to-indigo-600';
      case 'volunteer': return 'from-teal-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderItemFields = (item: ProfileAddition) => {
    const Icon = getTypeIcon(item.type);
    const colorClass = getTypeColor(item.type);

    return (
      <Card key={item.id} className="p-6 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 capitalize">{item.type}</h4>
              <p className="text-xs text-gray-500">Add new {item.type} to your profile</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {item.type === 'education' && (
            <>
              <div className="col-span-2">
                <label htmlFor={`institution-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Institution</label>
                <Input
                  id={`institution-${item.id}`}
                  placeholder="e.g. Stanford University"
                  value={item.data.institution}
                  onChange={(e) => updateItem(item.id, 'institution', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`degree-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Degree</label>
                <Select value={item.data.degree} onValueChange={(v: any) => updateItem(item.id, 'degree', v)}>
                  <SelectTrigger id={`degree-${item.id}`}>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Bachelor">Bachelor's</SelectItem>
                    <SelectItem value="Master">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor={`field-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Field of Study</label>
                <Input
                  id={`field-${item.id}`}
                  placeholder="e.g. Computer Science"
                  value={item.data.field}
                  onChange={(e) => updateItem(item.id, 'field', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`edu-startDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  id={`edu-startDate-${item.id}`}
                  type="month"
                  value={item.data.startDate}
                  onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`edu-endDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <Input
                  id={`edu-endDate-${item.id}`}
                  type="month"
                  value={item.data.endDate}
                  onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`gpa-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">GPA (Optional)</label>
                <Input
                  id={`gpa-${item.id}`}
                  placeholder="e.g. 3.8"
                  value={item.data.gpa}
                  onChange={(e) => updateItem(item.id, 'gpa', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`edu-location-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <Input
                  id={`edu-location-${item.id}`}
                  placeholder="e.g. Stanford, CA"
                  value={item.data.location}
                  onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                />
              </div>
            </>
          )}

          {item.type === 'certification' && (
            <>
              <div className="col-span-2">
                <label htmlFor={`certName-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Certification Name</label>
                <Input
                  id={`certName-${item.id}`}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={item.data.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`issuer-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Issuing Organization</label>
                <Input
                  id={`issuer-${item.id}`}
                  placeholder="e.g. Amazon Web Services"
                  value={item.data.issuer}
                  onChange={(e) => updateItem(item.id, 'issuer', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`issueDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Issue Date</label>
                <Input
                  id={`issueDate-${item.id}`}
                  type="month"
                  value={item.data.date}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`expiryDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date (Optional)</label>
                <Input
                  id={`expiryDate-${item.id}`}
                  type="month"
                  value={item.data.expiryDate}
                  onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`credentialId-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Credential ID (Optional)</label>
                <Input
                  id={`credentialId-${item.id}`}
                  placeholder="e.g. ABC123XYZ"
                  value={item.data.credentialId}
                  onChange={(e) => updateItem(item.id, 'credentialId', e.target.value)}
                />
              </div>
            </>
          )}

          {item.type === 'skill' && (
            <>
              <div>
                <label htmlFor={`skillName-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Skill Name</label>
                <Input
                  id={`skillName-${item.id}`}
                  placeholder="e.g. Python"
                  value={item.data.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`category-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <Select value={item.data.category} onValueChange={(v: any) => updateItem(item.id, 'category', v)}>
                  <SelectTrigger id={`category-${item.id}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                    <SelectItem value="Cloud">Cloud</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label htmlFor={`proficiency-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Proficiency Level: {item.data.level}/5</label>
                <input
                  id={`proficiency-${item.id}`}
                  type="range"
                  min="1"
                  max="5"
                  value={item.data.level}
                  onChange={(e) => updateItem(item.id, 'level', Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
              </div>
            </>
          )}

          {item.type === 'experience' && (
            <>
              <div>
                <label htmlFor={`company-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                <Input
                  id={`company-${item.id}`}
                  placeholder="e.g. Google"
                  value={item.data.company}
                  onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`position-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Position</label>
                <Input
                  id={`position-${item.id}`}
                  placeholder="e.g. Senior Data Analyst"
                  value={item.data.position}
                  onChange={(e) => updateItem(item.id, 'position', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`exp-location-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <Input
                  id={`exp-location-${item.id}`}
                  placeholder="e.g. San Francisco, CA"
                  value={item.data.location}
                  onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`exp-startDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  id={`exp-startDate-${item.id}`}
                  type="month"
                  value={item.data.startDate}
                  onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`exp-endDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <Input
                  id={`exp-endDate-${item.id}`}
                  type="month"
                  value={item.data.endDate}
                  onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                  disabled={item.data.current}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${item.id}`}
                  checked={item.data.current}
                  onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor={`current-${item.id}`} className="text-sm text-gray-700">Currently working here</label>
              </div>
              <div className="col-span-2">
                <label htmlFor={`exp-description-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea
                  id={`exp-description-${item.id}`}
                  placeholder="Describe your responsibilities and achievements..."
                  value={item.data.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {item.type === 'project' && (
            <>
              <div className="col-span-2">
                <label htmlFor={`projectName-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Project Name</label>
                <Input
                  id={`projectName-${item.id}`}
                  placeholder="e.g. E-commerce Analytics Dashboard"
                  value={item.data.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor={`projectDesc-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea
                  id={`projectDesc-${item.id}`}
                  placeholder="Describe the project and your contributions..."
                  value={item.data.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor={`technologies-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Technologies Used</label>
                <Input
                  id={`technologies-${item.id}`}
                  placeholder="e.g. Python, React, PostgreSQL"
                  value={item.data.technologies}
                  onChange={(e) => updateItem(item.id, 'technologies', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`proj-startDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  id={`proj-startDate-${item.id}`}
                  type="month"
                  value={item.data.startDate}
                  onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`proj-endDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">End Date (Optional)</label>
                <Input
                  id={`proj-endDate-${item.id}`}
                  type="month"
                  value={item.data.endDate}
                  onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor={`projectUrl-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Project URL (Optional)</label>
                <Input
                  id={`projectUrl-${item.id}`}
                  placeholder="https://github.com/username/project"
                  value={item.data.url}
                  onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                />
              </div>
            </>
          )}

          {item.type === 'publication' && (
            <>
              <div className="col-span-2">
                <label htmlFor={`pubTitle-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Publication Title</label>
                <Input
                  id={`pubTitle-${item.id}`}
                  placeholder="e.g. Machine Learning for Predictive Analytics"
                  value={item.data.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`journal-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Journal/Conference</label>
                <Input
                  id={`journal-${item.id}`}
                  placeholder="e.g. IEEE Transactions"
                  value={item.data.journal}
                  onChange={(e) => updateItem(item.id, 'journal', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`pubDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Publication Date</label>
                <Input
                  id={`pubDate-${item.id}`}
                  type="month"
                  value={item.data.date}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`authors-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Authors</label>
                <Input
                  id={`authors-${item.id}`}
                  placeholder="e.g. John Doe, Jane Smith"
                  value={item.data.authors}
                  onChange={(e) => updateItem(item.id, 'authors', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`doi-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">DOI (Optional)</label>
                <Input
                  id={`doi-${item.id}`}
                  placeholder="e.g. 10.1234/example.doi"
                  value={item.data.doi}
                  onChange={(e) => updateItem(item.id, 'doi', e.target.value)}
                />
              </div>
            </>
          )}

          {item.type === 'volunteer' && (
            <>
              <div>
                <label htmlFor={`organization-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Organization</label>
                <Input
                  id={`organization-${item.id}`}
                  placeholder="e.g. Red Cross"
                  value={item.data.organization}
                  onChange={(e) => updateItem(item.id, 'organization', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`role-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                <Input
                  id={`role-${item.id}`}
                  placeholder="e.g. Data Analyst Volunteer"
                  value={item.data.role}
                  onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`vol-location-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <Input
                  id={`vol-location-${item.id}`}
                  placeholder="e.g. Boston, MA"
                  value={item.data.location}
                  onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`vol-startDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                <Input
                  id={`vol-startDate-${item.id}`}
                  type="month"
                  value={item.data.startDate}
                  onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`vol-endDate-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">End Date (Optional)</label>
                <Input
                  id={`vol-endDate-${item.id}`}
                  type="month"
                  value={item.data.endDate}
                  onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor={`vol-description-${item.id}`} className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea
                  id={`vol-description-${item.id}`}
                  placeholder="Describe your volunteer work..."
                  value={item.data.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 via-orange-50 to-blue-50 rounded-xl border-2 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Profile Improvement Simulator
            </h3>
            <p className="text-sm text-gray-700">
              Add education, certifications, skills, or experience to see how they improve your queue positions
            </p>
          </div>
        </div>

        {/* Add Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('education')}
            className="border-blue-200 hover:bg-blue-50"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Add Education
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('certification')}
            className="border-orange-200 hover:bg-orange-50"
          >
            <Award className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('skill')}
            className="border-purple-200 hover:bg-purple-50"
          >
            <Code className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('experience')}
            className="border-green-200 hover:bg-green-50"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('project')}
            className="border-pink-200 hover:bg-pink-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Project
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('publication')}
            className="border-indigo-200 hover:bg-indigo-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Publication
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addItem('volunteer')}
            className="border-teal-200 hover:bg-teal-50"
          >
            <Users className="w-4 h-4 mr-2" />
            Add Volunteer Work
          </Button>
        </div>
      </div>

      {/* Added Items */}
      {additions.length > 0 && (
        <div className="space-y-4">
          {additions.map(item => renderItemFields(item))}
        </div>
      )}

      {/* Simulate Button */}
      {additions.length > 0 && (
        <div className="flex justify-center gap-3">
          <Button
            size="lg"
            onClick={simulateProfileImprovements}
            disabled={loading}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Simulating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Simulate Profile Improvements
              </>
            )}
          </Button>
          
          {Object.keys(queueResults).length > 0 && !applySuccess && (
            <Button
              size="lg"
              onClick={applySimulation}
              disabled={applying}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {applying ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Apply to Career Path
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Simulation Results */}
      {Object.keys(queueResults).length > 0 && (
        <div className="mt-6 space-y-4">
          {applySuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Milestones Applied Successfully</p>
                <p className="text-xs text-green-700">Your career path has been updated with the new milestones.</p>
              </div>
            </div>
          )}

          {/* Global Profile Summary */}
          {firstQueueResult && (
            <Card className="p-4 bg-slate-50 border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Current Profile Trajectory</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Current Match</div>
                  <div className="text-2xl font-bold text-slate-900">{firstQueueResult.current?.match_percentage?.toFixed(0) ?? 0}%</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Next Level</div>
                  <div className="text-2xl font-bold text-slate-900">{firstQueueResult.next?.match_percentage?.toFixed(0) ?? 0}%</div>
                </div>
              </div>
            </Card>
          )}

          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Simulation Results Across Your Queues
          </h4>
          {Object.entries(queueResults).map(([queueKey, result]) => {
            const bucket = bucketsToSimulate.find(b => `${b.industry}-${b.level}` === queueKey);
            if (!bucket) return null;
            return (
              <Card key={queueKey} className="p-4 bg-white border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{getIndustryLabel(bucket.industry)}</h5>
                    <p className="text-xs text-gray-500">{bucket.level}</p>
                  </div>
                </div>
                <SimulationResultCard result={result} compact />
              </Card>
            );
          })}
        </div>
      )}

      {/* Fallback to single result for backwards compatibility */}
      {!Object.keys(queueResults).length && (result || error) && (
        <div className="mt-6">
          <SimulationResultCard result={result} compact />
          {error && (
            <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>
      )}

      {/* Empty State */}
      {additions.length === 0 && (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">No items added yet</h4>
          <p className="text-sm text-gray-600 mb-4">
            Click the buttons above to add items to your simulated profile
          </p>
        </div>
      )}
    </div>
  );
}
