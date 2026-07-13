import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react';
import { recruiterCandidatesApi } from '../../../api/recruiterCandidates';
import type { NoteItem } from './types';
import { getNoteBadgeClass } from './utils';

export interface CandidateNotesSectionProps {
  candidateId: string | undefined;
  jobId: string | undefined;
}

export function CandidateNotesSection({ candidateId, jobId }: Readonly<CandidateNotesSectionProps>) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteType, setEditNoteType] = useState('general');

  useEffect(() => {
    const loadNotes = async () => {
      if (!candidateId) return;
      setNotesLoading(true);
      try {
        const result = await recruiterCandidatesApi.getCandidateNotes(candidateId, jobId);
        if (result.success) {
          setNotes(
            result.data.map((n: any) => ({
              id: String(n.id),
              type: n.note_type,
              content: n.content,
              author: n.recruiter_name || 'You',
              date: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
              timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            }))
          );
        }
      } catch {
        // silently fail; notes will remain empty
      } finally {
        setNotesLoading(false);
      }
    };
    void loadNotes();
  }, [candidateId, jobId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !candidateId) return;
    try {
      const result = await recruiterCandidatesApi.createCandidateNote(candidateId, {
        job_id: jobId,
        note_type: noteType,
        content: newNote.trim(),
      });
      if (result.success) {
        const created = result.data;
        setNotes((prev) => [
          {
            id: String(created.id),
            type: created.note_type,
            content: created.content,
            author: created.recruiter_name || 'Recruiter',
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
        setNewNote('');
        setNoteType('general');
      }
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!candidateId) return;
    try {
      await recruiterCandidatesApi.deleteCandidateNote(candidateId, Number(noteId));
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to delete note');
    }
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
    setEditNoteType(note.type);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
    setEditNoteType('general');
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!candidateId || !editNoteContent.trim()) return;
    try {
      const result = await recruiterCandidatesApi.updateCandidateNote(candidateId, Number(noteId), {
        note_type: editNoteType,
        content: editNoteContent.trim(),
      });
      if (result.success) {
        const updated = result.data;
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  type: updated.note_type,
                  content: updated.content,
                }
              : n
          )
        );
        setEditingNoteId(null);
      }
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to update note');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl text-gray-900 mb-6">Recruiter Notes</h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="cultural">Cultural Fit</SelectItem>
                <SelectItem value="concern">Concern</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Textarea
                placeholder="Add a note about this candidate..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleAddNote}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
              disabled={!newNote.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="border border-gray-200 rounded-lg p-4">
            {editingNoteId === note.id ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={editNoteType} onValueChange={setEditNoteType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="cultural">Cultural Fit</SelectItem>
                      <SelectItem value="concern">Concern</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    onClick={() => handleSaveEdit(note.id)}
                    disabled={!editNoteContent.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getNoteBadgeClass(note.type)}`}
                    >
                      {note.type}
                    </Badge>
                    <span className="text-sm text-gray-600">{note.author}</span>
                    <span className="text-sm text-gray-500">
                      {note.date} at {note.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(note)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700">{note.content}</p>
              </>
            )}
          </div>
        ))}

        {notesLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35] mx-auto mb-4" />
            <p>Loading notes...</p>
          </div>
        )}
        {!notesLoading && notes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No notes yet. Add your first note above.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
