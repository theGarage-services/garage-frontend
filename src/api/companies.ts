import apiClient from './client';
import type { User } from './auth';

// Company interfaces matching backend models
export interface Company {
  id: string;
  name: string;
  slug: string;
  company_type: string;
  industry: string;
  industry_display?: string;
  company_size: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  status: 'active' | 'pending' | 'draft';
  is_verified: boolean;
  logo?: string;
  banner?: string;
  founded_year?: number;
  tax_id?: string;
  settings?: CompanySettings;
  social_links?: SocialLinks;
  mission?: string;
  vision?: string;
  values?: string[];
  office_locations?: Array<{
    name: string;
    address: string;
    type: string;
    employees: number;
  }>;
  member_count?: number;
  open_positions_count?: number;
  total_applications?: number;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  invitations_enabled: boolean;
  approval_required: boolean;
  job_posting_limit: number;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  glassdoor?: string;
}

export interface CompanyMember {
  id: string;
  user: User;
  company: string;
  role: 'owner' | 'admin' | 'recruiter' | 'team-lead' | 'viewer';
  status: 'active' | 'pending' | 'invited' | 'removed';
  department?: string;
  job_title?: string;
  permissions: MemberPermissions;
  joined_at: string;
  invited_by?: string;
}

export interface MemberPermissions {
  can_post_jobs: boolean;
  can_view_candidates: boolean;
  can_manage_team: boolean;
  can_access_analytics: boolean;
  can_manage_company: boolean;
}

export interface CompanyJoinRequest {
  id: string;
  user: User;
  company: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyActivity {
  id: string;
  company: string;
  action_type: string;
  actor: User;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CompanyAnalytics {
  total_jobs_posted: number;
  active_jobs: number;
  total_interviews: number;
  total_applications: number;
  total_hires: number;
  success_rate: number;
  department_breakdown: Array<{ department: string; count: number }>;
  top_performers: Array<{
    user_id: number;
    name: string;
    interviews_conducted: number;
  }>;
}

// Create company data
export interface CreateCompanyData {
  name: string;
  company_type: string;
  industry: string;
  company_size: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  founded_year?: number;
  tax_id?: string;
}

// Update company data
export interface UpdateCompanyData {
  name?: string;
  company_type?: string;
  industry?: string;
  company_size?: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  founded_year?: number;
  settings?: CompanySettings;
  social_links?: SocialLinks;
  mission?: string;
  vision?: string;
  values?: string[];
  tax_id?: string;
  status?: 'active' | 'pending' | 'draft';
}

// Invite member data
export interface InviteMemberData {
  email: string;
  role: string;
  department?: string;
  job_title?: string;
  permissions?: Partial<MemberPermissions>;
}

// Join request data
export interface JoinRequestData {
  message?: string;
}

// Search filters
export interface CompanySearchFilters {
  query?: string;
  industry?: string;
  size?: string;
  location?: string;
  verified_only?: boolean;
}

class CompanyService {
  /**
   * Get the company for the current user
   */
  async getMyCompany(): Promise<Company> {
    const response = await apiClient.request('/companies/me/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }

    return await response.json();
  }

  /**
   * Get a single company by ID
   */
  async getCompany(id: string): Promise<Company> {
    const response = await apiClient.request(`/companies/${id}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }

    return await response.json();
  }

  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.request('/companies/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create company');
    }

    return await response.json();
  }

  /**
   * Update a company
   */
  async updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await apiClient.request(`/companies/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update company');
    }

    return await response.json();
  }

  /**
   * Update a company and optionally upload a new logo in one call.
   * If logo upload fails after a successful update, the error is
   * thrown with `partialUpdate: true` so callers can decide to
   * still surface the successful profile update.
   */
  async updateCompanyWithLogo(
    id: string,
    data: UpdateCompanyData,
    logoFile?: File | null
  ): Promise<Company> {
    const updated = await this.updateCompany(id, data);

    if (logoFile) {
      try {
        const { logo_url } = await this.uploadLogo(id, logoFile);
        updated.logo = logo_url;
      } catch (logoErr: any) {
        const err = new Error(
          logoErr?.message || 'Profile updated but logo upload failed'
        );
        (err as any).partialUpdate = true;
        (err as any).company = updated;
        throw err;
      }
    }

    return updated;
  }

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<void> {
    const response = await apiClient.request(`/companies/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete company');
    }
  }

  /**
   * Get company team members
   */
  async getMembers(companyId: string): Promise<CompanyMember[]> {
    const response = await apiClient.request(`/companies/${companyId}/members/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }

    return await response.json();
  }

  /**
   * Invite a new member
   */
  async inviteMember(companyId: string, data: InviteMemberData): Promise<CompanyMember> {
    const response = await apiClient.request(`/companies/${companyId}/members/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to invite member');
    }

    return await response.json();
  }

  /**
   * Remove a member
   */
  async removeMember(companyId: string, memberId: string): Promise<void> {
    const response = await apiClient.request(`/companies/${companyId}/members/${memberId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove member');
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    companyId: string,
    memberId: string,
    role: string,
    permissions?: Partial<MemberPermissions>
  ): Promise<CompanyMember> {
    const response = await apiClient.request(`/companies/${companyId}/members/${memberId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ role, permissions }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update member');
    }

    return await response.json();
  }

  /**
   * Search for companies to join
   */
  async searchCompanies(filters: CompanySearchFilters = {}): Promise<Company[]> {
    const params = new URLSearchParams();
    if (filters.query) params.append('search', filters.query);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.size) params.append('size', filters.size);
    if (filters.location) params.append('location', filters.location);
    if (filters.verified_only) params.append('verified_only', 'true');

    const response = await apiClient.request(`/companies/?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to search companies');
    }

    return await response.json();
  }

  /**
   * Request to join a company
   */
  async requestToJoin(companyId: string, data: JoinRequestData = {}): Promise<CompanyJoinRequest> {
    const response = await apiClient.request(`/companies/${companyId}/join/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to send join request');
    }

    return await response.json();
  }

  /**
   * Get pending join requests (for company admins)
   */
  async getJoinRequests(companyId: string): Promise<CompanyJoinRequest[]> {
    const response = await apiClient.request(`/join-requests/?company_id=${companyId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch join requests');
    }

    return await response.json();
  }

  /**
   * Respond to a join request
   */
  async respondToJoinRequest(
    requestId: string,
    action: 'accept' | 'reject'
  ): Promise<void> {
    const response = await apiClient.request(
      `/join-requests/${requestId}/respond/`,
      {
        method: 'PUT',
        body: JSON.stringify({ action }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to ${action} join request`);
    }
  }

  /**
   * Get company analytics
   */
  async getAnalytics(companyId: string): Promise<CompanyAnalytics> {
    const response = await apiClient.request(`/companies/${companyId}/analytics/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return await response.json();
  }

  /**
   * Get company activity feed
   */
  async getActivity(companyId: string, limit: number = 20): Promise<CompanyActivity[]> {
    const response = await apiClient.request(
      `/companies/${companyId}/activity/?limit=${limit}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }

    return await response.json();
  }

  /**
   * Upload company logo
   */
  async uploadLogo(companyId: string, file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.request(`/companies/${companyId}/upload-logo/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }

    return await response.json();
  }

  /**
   * Upload company banner
   */
  async uploadBanner(companyId: string, file: File): Promise<{ banner_url: string }> {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await apiClient.request(`/companies/${companyId}/upload-banner/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload banner');
    }

    return await response.json();
  }

  /**
   * Upload verification document
   */
  async uploadVerificationDocument(
    companyId: string,
    file: File
  ): Promise<{ document_url: string }> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.request(`/companies/${companyId}/verify/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload verification document');
    }

    return await response.json();
  }
}

export const companyService = new CompanyService();

// Re-export types for convenience
export type {
  Company as Institution,
  CompanyMember as TeamMember,
  CompanyAnalytics as InstitutionAnalytics,
};
