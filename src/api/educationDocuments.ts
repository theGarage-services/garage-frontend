import apiClient from './client';

export interface EducationDocument {
  id: number;
  candidate: number;
  candidate_name: string;
  education_index: number;
  document_type: 'transcript' | 'degree_certificate';
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

export interface EducationDocumentUploadData {
  education_index: number;
  document_type: 'transcript' | 'degree_certificate';
  file: File;
}

class EducationDocumentService {
  async getDocuments(params?: {
    candidate_id?: number;
    education_index?: number;
    document_type?: 'transcript' | 'degree_certificate';
  }): Promise<EducationDocument[]> {
    const searchParams = new URLSearchParams();
    if (params?.candidate_id) searchParams.append('candidate_id', params.candidate_id.toString());
    if (params?.education_index !== undefined) {
      searchParams.append('education_index', params.education_index.toString());
    }
    if (params?.document_type) searchParams.append('document_type', params.document_type);

    const queryString = searchParams.toString();
    const url = `/verifications/education-documents/${queryString ? '?' + queryString : ''}`;

    const response = await apiClient.request(url, { method: 'GET' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch education documents');
    }
    const documents: EducationDocument[] = await response.json();
    return documents.map(doc => ({ ...doc, file_url: normalizeFileUrl(doc.file_url) }));
  }

  async uploadDocument(data: EducationDocumentUploadData): Promise<EducationDocument> {
    const formData = new FormData();
    formData.append('education_index', data.education_index.toString());
    formData.append('document_type', data.document_type);
    formData.append('file', data.file);

    const response = await apiClient.request('/verifications/education-documents/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload document');
    }
    const document: EducationDocument = await response.json();
    return { ...document, file_url: normalizeFileUrl(document.file_url) };
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await apiClient.request(`/verifications/education-documents/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete document');
    }
  }
}

export const educationDocumentService = new EducationDocumentService();
