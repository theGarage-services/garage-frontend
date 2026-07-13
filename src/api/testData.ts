import apiClient from './client';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  application_date: string;
  user: number;
}

export interface Queue {
  id: number;
  name: string;
  description: string;
  category: 'software-engineering' | 'data-science' | 'product-management' | 'design' | 'marketing' | 'sales' | 'customer-support' | 'hr';
  color: string;
  icon: string;
  user: number;
}

export interface UserStats {
  total_applications: number;
  applications_by_status: Record<string, number>;
  applications_by_queue: Record<string, number>;
  recent_applications: Job[];
}

class TestDataService {
  // Create sample jobs for testing
  static async createSampleJobs(): Promise<Job[]> {
    const sampleJobs: Job[] = [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        description: 'Looking for an experienced frontend developer to join our growing team.',
        requirements: '5+ years React experience, TypeScript, Node.js',
        salary_range: '$120k - $160k',
        job_type: 'full-time',
        status: 'applied',
        application_date: '2024-01-20',
        user: 1
      },
      {
        id: 2,
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        description: 'Join our remote-first team as a full stack engineer.',
        requirements: 'React, Python, PostgreSQL, AWS',
        salary_range: '$100k - $140k',
        job_type: 'remote',
        status: 'interviewing',
        application_date: '2024-01-15',
        user: 1
      },
      {
        id: 3,
        title: 'React Developer',
        company: 'Digital Agency',
        location: 'New York, NY',
        description: 'Seeking React developer for client projects.',
        requirements: 'React, CSS, JavaScript, responsive design',
        salary_range: '$80k - $110k',
        job_type: 'contract',
        status: 'offered',
        application_date: '2024-01-10',
        user: 2
      },
      {
        id: 4,
        title: 'Product Manager',
        company: 'Enterprise Inc',
        location: 'Seattle, WA',
        description: 'Lead product development initiatives.',
        requirements: '5+ years PM experience, agile, data analysis',
        salary_range: '$130k - $170k',
        job_type: 'full-time',
        status: 'applied',
        application_date: '2024-01-23',
        user: 3
      },
      {
        id: 5,
        title: 'UX Designer',
        company: 'Design Studio',
        location: 'Austin, TX',
        description: 'Create beautiful user experiences.',
        requirements: 'Figma, Adobe XD, prototyping',
        salary_range: '$90k - $120k',
        job_type: 'full-time',
        status: 'rejected',
        application_date: '2024-01-05',
        user: 4
      }
    ];

    // Sync with backend (best effort - returns local data regardless)
    for (const job of sampleJobs) {
      await apiClient.createJob(job).catch(() => { /* ignore individual failures */ });
    }
    return sampleJobs;
  }

  // Create sample queues for testing
  static async createSampleQueues(): Promise<Queue[]> {
    const sampleQueues: Queue[] = [
      {
        id: 1,
        name: 'Software Engineering',
        description: 'Frontend, backend, and full stack positions',
        category: 'software-engineering',
        color: '#3B82F6',
        icon: 'code',
        user: 1
      },
      {
        id: 2,
        name: 'Product Management',
        description: 'Product and project management roles',
        category: 'product-management',
        color: '#10B981',
        icon: 'briefcase',
        user: 1
      },
      {
        id: 3,
        name: 'Design & UX',
        description: 'UI/UX design and research positions',
        category: 'design',
        color: '#F59E0B',
        icon: 'palette',
        user: 2
      },
      {
        id: 4,
        name: 'Data Science',
        description: 'Data analysis and machine learning roles',
        category: 'data-science',
        color: '#8B5CF6',
        icon: 'bar-chart',
        user: 3
      }
    ];

    // Sync with backend (best effort - returns local data regardless)
    for (const queue of sampleQueues) {
      await apiClient.createQueue(queue).catch(() => { /* ignore individual failures */ });
    }
    return sampleQueues;
  }

  // Get mock stats for testing
  static getMockStats(): UserStats {
    return {
      total_applications: 5,
      applications_by_status: {
        'applied': 2,
        'interviewing': 1,
        'offered': 1,
        'rejected': 1,
        'withdrawn': 0
      },
      applications_by_queue: {
        'Software Engineering': 2,
        'Product Management': 1,
        'Design & UX': 1,
        'Data Science': 1
      },
      recent_applications: [
        {
          id: 4,
          title: 'Product Manager',
          company: 'Enterprise Inc',
          location: 'Seattle, WA',
          description: 'Lead product development initiatives.',
          requirements: '5+ years PM experience, agile, data analysis',
          salary_range: '$130k - $170k',
          job_type: 'full-time',
          status: 'applied',
          application_date: '2024-01-23',
          user: 3
        },
        {
          id: 1,
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          description: 'Looking for an experienced frontend developer to join our growing team.',
          requirements: '5+ years React experience, TypeScript, Node.js',
          salary_type: 'full-time',
          status: 'applied',
          application_date: '2024-01-20',
          user: 1
        }
      ] as Job[]
    };
  }

  // Initialize test data
  static async initializeTestData(): Promise<void> {
    try {
      
      // Create sample jobs and queues
      await this.createSampleJobs();
      await this.createSampleQueues();
      
    } catch (error) {
      console.error('Error initializing test data:', error);
    }
  }

  // Clear all test data
  static async clearTestData(): Promise<void> {
    try {
      
      // Get all jobs and delete them
      const jobs = await apiClient.getJobs();
      for (const job of jobs) {
        await apiClient.deleteJob(job.id);
      }
      
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  }
}

export default TestDataService;
