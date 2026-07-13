import apiClient from './client';

export interface ExperienceDocument {
  id: number;
  candidate: number;
  candidate_name: string;
  work_history_index: number;
  document_type: 'employment_letter';
  file: string;
  file_url: string;
  uploaded_at: string;
  updated_at: string;
}

const normalizeFileUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${url}`;
};

export interface ExperienceDocumentUploadData {
  work_history_index: number;
  document_type: 'employment_letter';
  file: File;
}

class ExperienceDocumentService {
  async getDocuments(params?: {
    candidate_id?: number;
    work_history_index?: number;
    document_type?: 'employment_letter';
  }): Promise<ExperienceDocument[]> {
    const searchParams = new URLSearchParams();
    if (params?.candidate_id) searchParams.append('candidate_id', params.candidate_id.toString());
    if (params?.work_history_index !== undefined) {
      searchParams.append('work_history_index', params.work_history_index.toString());
    }
    if (params?.document_type) searchParams.append('document_type', params.document_type);

    const queryString = searchParams.toString();
    const url = `/verifications/experience-documents/${queryString ? '?' + queryString : ''}`;

    const response = await apiClient.request(url, { method: 'GET' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch experience documents');
    }
    const documents: ExperienceDocument[] = await response.json();
    return documents.map(doc => ({ ...doc, file_url: normalizeFileUrl(doc.file_url) }));
  }

  async uploadDocument(data: ExperienceDocumentUploadData): Promise<ExperienceDocument> {
    const formData = new FormData();
    formData.append('work_history_index', data.work_history_index.toString());
    formData.append('document_type', data.document_type);
    formData.append('file', data.file);

    const response = await apiClient.request('/verifications/experience-documents/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }
    const document: ExperienceDocument = await response.json();
    return { ...document, file_url: normalizeFileUrl(document.file_url) };
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await apiClient.request(`/verifications/experience-documents/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete document');
    }
  }
}

export const experienceDocumentService = new ExperienceDocumentService();
