import { Eye, FileDown, FileCheck } from 'lucide-react';
import type { ExperienceDocument } from './types';
import { openDocumentPreview, downloadDocument } from './utils';

export interface ExperienceDocumentsProps {
  docs: ExperienceDocument[];
}

export function ExperienceDocuments({ docs }: Readonly<ExperienceDocumentsProps>) {
  const employmentLetter = docs.find(d => d.document_type === 'employment_letter');
  if (!employmentLetter) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1">Documents</p>
      <div className="flex flex-wrap items-center gap-2">
        <FileCheck className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-700">Employment Letter</span>
        <button
          onClick={() => openDocumentPreview(employmentLetter.file_url)}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => downloadDocument(employmentLetter.file_url, 'employment_letter')}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
          title="Download"
        >
          <FileDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
