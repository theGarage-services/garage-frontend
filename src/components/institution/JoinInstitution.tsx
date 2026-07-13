import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  Globe, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { companyService, type Company } from '../../api/companies';

interface JoinInstitutionProps {
  onBack: () => void;
  onJoinRequest: (institutionData: any) => void;
  recruiterData: any;
}

export function JoinInstitution({ onBack, onJoinRequest, recruiterData }: Readonly<JoinInstitutionProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real companies from API
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search companies via API
  const searchCompanies = useCallback(async () => {
    if (!searchTerm.trim()) {
      setCompanies([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await companyService.searchCompanies({
        query: searchTerm,
        verified_only: false
      });
      setCompanies(results);
    } catch (err) {
      console.error('Error searching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to search companies');
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCompanies();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchCompanies]);

  // Handle join request
  const handleJoinRequest = async () => {
    if (!selectedInstitution?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await companyService.requestToJoin(selectedInstitution.id, {
        message: requestMessage
      });
      
      onJoinRequest(selectedInstitution);
      setShowRequestForm(false);
      setRequestMessage('');
    } catch (err) {
      console.error('Error sending join request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send join request');
    } finally {
      setIsLoading(false);
    }
  };


  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Unverified
          </Badge>
        );
    }
  };

  const getInstitutionTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'corporation': 'Corporation',
      'startup': 'Startup',
      'nonprofit': 'Non-profit',
      'government': 'Government',
      'university': 'University',
      'healthcare': 'Healthcare',
      'consulting': 'Consulting',
      'agency': 'Agency',
      'other': 'Other'
    };
    return typeMap[type] || type;
  };

  const getIndustryLabel = (industry: string) => {
    const industryMap: { [key: string]: string } = {
      'technology': 'Technology',
      'finance': 'Finance & Banking',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'manufacturing': 'Manufacturing',
      'retail': 'Retail & E-commerce',
      'consulting': 'Consulting',
      'media': 'Media & Entertainment',
      'energy': 'Energy & Utilities',
      'government': 'Government',
      'nonprofit': 'Non-profit',
      'other': 'Other'
    };
    return industryMap[industry] || industry;
  };

  if (showRequestForm && selectedInstitution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">
              Request to Join Institution
            </h2>
            <p className="text-gray-500">
              Send a request to join {selectedInstitution.name}
            </p>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            {/* Institution Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium">
                  {selectedInstitution.name?.[0] || 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{selectedInstitution.name}</h3>
                    {getVerificationBadge(selectedInstitution.is_verified ? 'verified' : 'pending')}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{selectedInstitution.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>{getInstitutionTypeLabel(selectedInstitution.company_type)}</span>
                    <span>•</span>
                    <span>{getIndustryLabel(selectedInstitution.industry)}</span>
                    <span>•</span>
                    <span>{`${selectedInstitution.city || ''}, ${selectedInstitution.country || ''}`.trim() || 'Location not set'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Message to Institution Admin</Label>
                <textarea
                  id="message"
                  placeholder="Introduce yourself and explain why you'd like to join this institution..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500">
                  {requestMessage.length}/500 characters
                </div>
              </div>

              {/* Your Information Summary */}
              <div className="space-y-2">
                <Label>Your Information</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{recruiterData.firstName} {recruiterData.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{recruiterData.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Job Title:</span>
                      <p className="font-medium">{recruiterData.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <p className="font-medium">{recruiterData.company || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Notice */}
              {selectedInstitution.settings?.approval_required !== false && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    This institution requires admin approval for new members. You'll receive an email notification once your request is reviewed.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowRequestForm(false)}
                className="px-6 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>

              <Button
                onClick={handleJoinRequest}
                disabled={isLoading || !requestMessage.trim()}
                className="px-8 w-full sm:w-auto bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending Request...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-medium">
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-700 mb-2">
            Join an Existing Institution
          </h2>
          <p className="text-gray-500">
            Search and request to join institutions already registered on theGarage
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Search */}
          <div className="mb-6">
            <Label htmlFor="search" className="mb-2 block">Search Institutions</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="search"
                placeholder="Search by company name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm.trim() ? 'No institutions found matching your search.' : 'Start typing to search for institutions.'}
                </p>
              </div>
            ) : (
              companies.map((company) => (
                <div key={company.id} className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-xl">
                        {company.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                          {getVerificationBadge(company.is_verified ? 'verified' : 'pending')}
                        </div>
                        

                        <p className="text-gray-600 mb-3">{company.description || 'No description available'}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500 mb-3">
                          <span>{getInstitutionTypeLabel(company.company_type)}</span>
                          <span>•</span>
                          <span>{getIndustryLabel(company.industry)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {company.city && company.country ? `${company.city}, ${company.country}` : company.country || company.city || 'Location not set'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Users className="w-4 h-4" />
                            <span>{company.company_size || 'Size not specified'}</span>
                          </div>
                          {company.website && (
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#ff6b35] hover:underline"
                            >
                              <Globe className="w-4 h-4" />
                              Website
                            </a>
                          )}
                        </div>

                        {company.settings?.approval_required && (
                          <div className="mt-3">
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              Requires approval
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedInstitution(company);
                          setShowRequestForm(true);
                        }}
                        size="sm"
                        className="bg-[#ff6b35] hover:bg-[#e55a2b] flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Request to Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Back Button */}
          <div className="flex justify-start pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onBack}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}