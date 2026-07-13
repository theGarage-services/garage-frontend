import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppHeader } from '../layout/AppHeader';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Filter,
  FolderOpen,
  File,
  Image as ImageIcon,
  Lock,
  Clock,
  MoreVertical,
  Plus,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface DocumentManagementCenterProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function DocumentManagementCenter({
  user,
  onNavigate,
  onLogout
}: Readonly<DocumentManagementCenterProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All Documents', count: 24 },
    { id: 'legal', name: 'Legal & Compliance', count: 6 },
    { id: 'templates', name: 'Templates', count: 8 },
    { id: 'policies', name: 'Policies', count: 5 },
    { id: 'branding', name: 'Branding Assets', count: 3 },
    { id: 'reports', name: 'Reports', count: 2 }
  ];

  const documents = [
    {
      id: 'doc-1',
      name: 'Offer Letter Template - Engineering.docx',
      category: 'templates',
      type: 'docx',
      size: '45 KB',
      uploadedBy: { name: 'Sarah Johnson', avatar: null },
      uploadedAt: '2024-01-10',
      version: '2.1',
      downloads: 23,
      accessLevel: 'manager'
    },
    {
      id: 'doc-2',
      name: 'Articles of Incorporation.pdf',
      category: 'legal',
      type: 'pdf',
      size: '892 KB',
      uploadedBy: { name: 'Admin', avatar: null },
      uploadedAt: '2023-12-01',
      version: '1.0',
      downloads: 5,
      accessLevel: 'admin'
    },
    {
      id: 'doc-3',
      name: 'Employee Handbook 2024.pdf',
      category: 'policies',
      type: 'pdf',
      size: '1.2 MB',
      uploadedBy: { name: 'HR Department', avatar: null },
      uploadedAt: '2024-01-05',
      version: '3.0',
      downloads: 48,
      accessLevel: 'all'
    },
    {
      id: 'doc-4',
      name: 'Company Logo - Primary.svg',
      category: 'branding',
      type: 'svg',
      size: '12 KB',
      uploadedBy: { name: 'Design Team', avatar: null },
      uploadedAt: '2023-11-15',
      version: '1.0',
      downloads: 67,
      accessLevel: 'all'
    },
    {
      id: 'doc-5',
      name: 'GDPR Compliance Policy.pdf',
      category: 'legal',
      type: 'pdf',
      size: '324 KB',
      uploadedBy: { name: 'Legal Team', avatar: null },
      uploadedAt: '2024-01-08',
      version: '1.2',
      downloads: 12,
      accessLevel: 'admin'
    },
    {
      id: 'doc-6',
      name: 'Interview Guide - Technical Roles.docx',
      category: 'templates',
      type: 'docx',
      size: '67 KB',
      uploadedBy: { name: 'Sarah Johnson', avatar: null },
      uploadedAt: '2024-01-12',
      version: '1.5',
      downloads: 34,
      accessLevel: 'all'
    },
    {
      id: 'doc-7',
      name: 'Q4 2023 Recruiting Report.xlsx',
      category: 'reports',
      type: 'xlsx',
      size: '156 KB',
      uploadedBy: { name: 'Analytics Team', avatar: null },
      uploadedAt: '2024-01-03',
      version: '1.0',
      downloads: 8,
      accessLevel: 'lead'
    },
    {
      id: 'doc-8',
      name: 'Code of Conduct.pdf',
      category: 'policies',
      type: 'pdf',
      size: '245 KB',
      uploadedBy: { name: 'HR Department', avatar: null },
      uploadedAt: '2023-12-20',
      version: '2.0',
      downloads: 56,
      accessLevel: 'all'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'svg':
      case 'png':
      case 'jpg':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAccessBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Admin Only</Badge>;
      case 'lead':
        return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Lead+</Badge>;
      case 'manager':
        return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Manager+</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">All Access</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole={user?.role === 'master' ? 'admin' : 'recruiter'}
        user={user}
        currentView="documents"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-white mb-2">Document Management</h1>
                  <p className="text-indigo-100">Centralized repository for all company documents</p>
                </div>
              </div>
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-white text-indigo-600 hover:bg-indigo-50 self-start sm:self-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Categories */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>

                {/* Storage Info */}
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">Storage Used</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-white rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">4.2 GB of 10 GB</p>
                </div>
              </Card>
            </div>

            {/* Main Content - Documents */}
            <div className="col-span-1 lg:col-span-9">
              {/* Search and Filter */}
              <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="self-start">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </Card>

              {/* Documents Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Access
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(doc.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">Version {doc.version}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={doc.uploadedBy.avatar ?? undefined} />
                                <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                                  {doc.uploadedBy.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-900">{doc.uploadedBy.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {doc.uploadedAt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {doc.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getAccessBadge(doc.accessLevel)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Manage Access
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredDocuments.length === 0 && (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-600">
                      {searchQuery ? 'Try adjusting your search' : 'Upload documents to get started'}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-[95vw] sm:max-w-lg w-full p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-medium text-gray-900">Upload Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  id="category"
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option>Legal & Compliance</option>
                  <option>Templates</option>
                  <option>Policies</option>
                  <option>Branding Assets</option>
                  <option>Reports</option>
                </select>
              </div>

              <div>
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <select 
                  id="accessLevel"
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option>All Users</option>
                  <option>Manager and Above</option>
                  <option>Lead and Above</option>
                  <option>Admin Only</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
