import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';

interface JobDescriptionTabsProps {
  description: string;
  summary?: string;
  responsibilities?: string[];
  company: string;
  companyIndustry?: string;
}

export function JobDescriptionTabs({
  description,
  summary,
  responsibilities,
  company,
  companyIndustry
}: Readonly<JobDescriptionTabsProps>) {
  const [selectedTab, setSelectedTab] = useState<'description' | 'summary' | 'responsibilities' | 'company'>('description');

  const companyContent = `Learn more about ${company} and what makes them a great place to work. Join a team that values innovation, growth, and making a meaningful impact in ${companyIndustry || 'the industry'}.`;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('description')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'description'
                  ? 'border-[#ff6b35] text-[#ff6b35]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Job Description
            </button>
            <button
              onClick={() => setSelectedTab('summary')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'summary'
                  ? 'border-[#ff6b35] text-[#ff6b35]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setSelectedTab('responsibilities')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'responsibilities'
                  ? 'border-[#ff6b35] text-[#ff6b35]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Responsibilities
            </button>
            <button
              onClick={() => setSelectedTab('company')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'company'
                  ? 'border-[#ff6b35] text-[#ff6b35]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              About Company
            </button>
          </div>
        </div>

        <div className="prose prose-gray max-w-none">
          {selectedTab === 'description' && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {description || 'No description provided.'}
            </div>
          )}
          {selectedTab === 'summary' && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {summary || 'No summary provided.'}
            </div>
          )}
          {selectedTab === 'responsibilities' && (
            <div className="space-y-2">
              {responsibilities?.length ? responsibilities.map((item) => (
                <div key={`resp-${item}`} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              )) : (
                <p className="text-gray-500 italic">No responsibilities listed.</p>
              )}
            </div>
          )}
          {selectedTab === 'company' && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {companyContent}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
