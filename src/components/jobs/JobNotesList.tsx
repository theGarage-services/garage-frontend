import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft, FileText, ExternalLink, Calendar, Pencil, Trash2, Save, X, CheckCircle
} from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { jobPostsApi } from '../../api/jobPosts';

interface JobNoteItem {
  id: number;
  job: number;
  job_title: string;
  company: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface JobNotesListProps {
  onNavigate?: (view: string) => void;
  user?: any;
  onLogout?: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function JobNotesList({ onNavigate, user, onLogout }: Readonly<JobNotesListProps>) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<JobNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const result = await jobPostsApi.getAllJobNotes();
      if (result.success) {
        setNotes(result.data);
      } else {
        setError('Failed to load notes');
      }
    } catch (err) {
      console.error('Error fetching job notes:', err);
      setError('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewJob = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  const startEdit = (note: JobNoteItem) => {
    setEditingId(note.id);
    setEditText(note.notes);
    setDeletingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (jobId: number) => {
    setIsSaving(true);
    try {
      await jobPostsApi.updateJobNotes(String(jobId), editText);
      setNotes((prev) =>
        prev.map((n) =>
          n.job === jobId ? { ...n, notes: editText, updated_at: new Date().toISOString() } : n
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update note:', err);
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (noteId: number) => {
    setDeletingId(noteId);
    setEditingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleDelete = async (jobId: number) => {
    setIsDeleting(true);
    try {
      await jobPostsApi.deleteJobNotes(String(jobId));
      setNotes((prev) => prev.filter((n) => n.job !== jobId));
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole="job-seeker"
        user={user}
        currentView="job-notes"
        onNavigate={onNavigate || ((v: string) => navigate(`/${v}`))}
        onLogout={onLogout || (() => {})}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Job Notes</h1>
            <p className="text-gray-600">All your personal notes about jobs you've viewed</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]" />
            <span className="ml-3 text-gray-600">Loading notes...</span>
          </div>
        )}

        {error && (
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => { setError(null); fetchNotes(); }} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              Try Again
            </Button>
          </Card>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">
              Start viewing jobs and saving notes to see them all here.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              Browse Jobs
            </Button>
          </Card>
        )}

        {!isLoading && !error && notes.length > 0 && (
          <div className="space-y-4">
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const isConfirmingDelete = deletingId === note.id;

              return (
                <Card
                  key={note.id}
                  className="p-6 border-l-4 border-l-[#ff6b35] hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{note.job_title}</h3>
                      <p className="text-gray-600">{note.company}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
                      onClick={() => handleViewJob(note.job)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </Button>
                  </div>

                  {isConfirmingDelete && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm mb-3">
                        Are you sure you want to delete these notes?
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={cancelDelete}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete(note.job)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="mb-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[120px] bg-gray-50 border-gray-200 text-gray-700 resize-none mb-3"
                        placeholder="Edit your notes..."
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                          onClick={() => handleSaveEdit(note.job)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Save className="w-4 h-4 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line">
                      {note.notes.length > 200 ? `${note.notes.slice(0, 200)}...` : note.notes}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Last updated: {formatDate(note.updated_at)}</span>
                    </div>
                    {!isEditing && !isConfirmingDelete && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-[#ff6b35] hover:bg-orange-50"
                          onClick={() => startEdit(note)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => confirmDelete(note.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
