import apiClient from './client';

export interface RecruiterProfileData {
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  department: string | null;
  website: string | null;
  institution: Record<string, unknown> | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  timezone: string | null;
  profile_image: string | null;
  company_id: string | null;
  is_institutional: boolean | null;
  slug: string | null;
  company_type: string | null;
  company_industry: string | null;
  company_status: string | null;
}

export interface RecruiterProfile {
  success: boolean;
  user_data: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  recruiter_profile_data: RecruiterProfileData | null;
  candidate_profile_data: Record<string, unknown> | null;
  role: string;
  tier: string;
  industry: string;
  profile_complete: boolean;
}

export interface UpdateRecruiterProfileData {
  company?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  department?: string;
  website?: string;
  institution?: Record<string, unknown>;
  bio?: string;
  // User fields that can be updated
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  timezone?: string;
  profile_image?: string;
}

// Company size options matching backend
export const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

export interface PublicRecruiterProfile {
  name: string;
  title: string;
  company: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  email: string | null;
}

class RecruiterProfileService {
  /**
   * Get the current user's recruiter profile
   */
  async getProfile(): Promise<RecruiterProfile | null> {
    try {
      const response = await apiClient.request('/accounts/profile/', {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch recruiter profile');
      }

      const data = await response.json();
      return data as RecruiterProfile;
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      return null;
    }
  }

  /**
   * Get public recruiter profile by user ID (for job details pages)
   */
  async getPublicProfile(userId: number): Promise<PublicRecruiterProfile | null> {
    try {
      const response = await apiClient.request(`/accounts/recruiter/${userId}/public-profile/`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch public recruiter profile');
      }

      const result = await response.json();
      return result.data as PublicRecruiterProfile;
    } catch (error) {
      console.error('Error fetching public recruiter profile:', error);
      return null;
    }
  }

  /**
   * Upload recruiter profile image
   */
  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profile_image', file);

    const response = await apiClient.request('/accounts/upload-profile-image/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile image');
    }

    const result = await response.json();
    return result.profile_image_url as string;
  }

  /**
   * Update the recruiter profile
   */
  async updateProfile(data: UpdateRecruiterProfileData): Promise<RecruiterProfile> {
    const response = await apiClient.request('/accounts/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update recruiter profile');
    }

    return await response.json() as RecruiterProfile;
  }

  /**
   * Transform backend profile to frontend format
   */
  transformProfileForFrontend(profile: RecruiterProfile): Record<string, unknown> {
    const userData = profile.user_data || { first_name: '', last_name: '', email: '', username: '' };
    const recruiterData = profile.recruiter_profile_data || {
      company_name: null, company_size: null, industry: null, department: null,
      website: null, institution: null, bio: null, phone: null, location: null,
      linkedin: null, timezone: null, profile_image: null, company_id: null,
      is_institutional: null, slug: null, company_type: null,
      company_industry: null, company_status: null
    };
    return {
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      phone: recruiterData.phone,
      company: recruiterData.company_name,
      title: recruiterData.company_name,
      companySize: recruiterData.company_size,
      industry: recruiterData.industry || profile.industry,
      department: recruiterData.department,
      bio: recruiterData.bio,
      location: recruiterData.location,
      website: recruiterData.website,
      institution: recruiterData.institution,
      timezone: recruiterData.timezone || 'America/Los_Angeles',
      linkedin: recruiterData.linkedin,
      profileImage: recruiterData.profile_image,
      slug: recruiterData.slug,
      companyType: recruiterData.company_type,
      companyIndustry: recruiterData.company_industry,
      companyStatus: recruiterData.company_status,
    };
  }

  /**
   * Transform frontend data to backend format
   */
  transformDataForBackend(data: Record<string, unknown>): UpdateRecruiterProfileData {
    return {
      first_name: (data.firstName as string) || '',
      last_name: (data.lastName as string) || '',
      phone: (data.phone as string) || '',
      location: (data.location as string) || '',
      company_name: (data.company as string) || (data.title as string) || '',
      company_size: (data.companySize as string) || '',
      industry: (data.industry as string) || '',
      department: (data.department as string) || '',
      website: (data.website as string) || '',
      institution: (data.institution as Record<string, unknown>) || {},
      bio: (data.bio as string) || '',
      timezone: (data.timezone as string) || '',
      linkedin: (data.linkedin as string) || '',
    };
  }
}

/**
 * Build a full image URL from a backend file path/URL.
 * Handles relative paths, absolute URLs, and corrupted double-prefix paths.
 */
export function buildProfileImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
  const decoded = decodeURIComponent(url);
  const mediaParts = decoded.split('/media/');
  if (mediaParts.length > 2) {
    const realPath = mediaParts.at(-1);
    return `${base}/media/${realPath}`;
  }

  // Clean absolute URL
  if (decoded.startsWith('http')) {
    return decoded;
  }

  // Normal relative path from backend
  return decoded.startsWith('/') ? `${base}${decoded}` : `${base}/${decoded}`;
}

export const recruiterProfileService = new RecruiterProfileService();
