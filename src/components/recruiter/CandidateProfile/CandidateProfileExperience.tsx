import { Card } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { GraduationCap, MapPin, Eye, FileDown, FileCheck } from 'lucide-react';
import { ExperienceDocuments } from './ExperienceDocuments';
import type { EducationDocument, EducationItem, ExperienceDocument, ExperienceItem } from './types';
import { formatExperienceRange, getDocumentsForExperience, getDocumentsForEducation, openDocumentPreview, downloadDocument } from './utils';

export interface CandidateProfileExperienceProps {
  candidate: any;
  educationDocuments: EducationDocument[];
  experienceDocuments: ExperienceDocument[];
}

export function CandidateProfileExperience({
  candidate,
  educationDocuments,
  experienceDocuments,
}: Readonly<CandidateProfileExperienceProps>) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl text-gray-900 mb-6">Work Experience</h3>
        {candidate.experience_detailed.length === 0 ? (
          <p className="text-gray-500">No work experience recorded.</p>
        ) : (
          <div className="space-y-8">
            {candidate.experience_detailed.map((exp: ExperienceItem, index: number) => (
              <div key={`${exp.title}-${index}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{exp.title}</h4>
                    <p className="text-[#ff6b35] font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-600">
                      {[exp.location, formatExperienceRange(exp)].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{exp.description}</p>

                {exp.achievements && exp.achievements.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {exp.achievements.map((achievement: string) => (
                        <li key={achievement} className="text-sm text-gray-700">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <ExperienceDocuments docs={getDocumentsForExperience(experienceDocuments, index)} />

                {index < candidate.experience_detailed.length - 1 && (
                  <Separator className="mt-8" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-xl text-gray-900 mb-6">Education</h3>
        {candidate.education.length === 0 ? (
          <p className="text-gray-500">No education recorded.</p>
        ) : (
          <div className="space-y-4">
            {candidate.education.map((edu: EducationItem, eduIndex: number) => {
              const docs = getDocumentsForEducation(educationDocuments, eduIndex);
              const transcript = docs.find(d => d.document_type === 'transcript');
              const degreeCertificate = docs.find(d => d.document_type === 'degree_certificate');
              return (
                <div key={`${edu.school}-${edu.degree}-${eduIndex}`} className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                    <p className="text-gray-600">{edu.school || edu.institution}</p>
                    {(edu.location || edu.year || (edu.start_year && edu.end_year) || edu.gpa) && (
                      <p className="text-sm text-gray-500">
                        {edu.location && (
                          <span className="inline-flex items-center gap-1 mr-2">
                            <MapPin className="w-3 h-3" />
                            {edu.location}
                          </span>
                        )}
                        {edu.year || (edu.start_year && edu.end_year ? `${edu.start_year} - ${edu.end_year}` : '')}
                        {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                      </p>
                    )}
                    {docs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Documents</p>
                        {transcript && (
                          <div className="flex flex-wrap items-center gap-2">
                            <FileCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">Transcript</span>
                            <button
                              onClick={() => openDocumentPreview(transcript.file_url)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadDocument(transcript.file_url, 'transcript')}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              title="Download"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {degreeCertificate && (
                          <div className="flex items-center gap-2 mt-1">
                            <FileCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">Degree Certificate</span>
                            <button
                              onClick={() => openDocumentPreview(degreeCertificate.file_url)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadDocument(degreeCertificate.file_url, 'degree_certificate')}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              title="Download"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
