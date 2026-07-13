import { Save, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';

interface NotesSectionProps {
  initialNotes?: string;
  onSave: (notes: string) => Promise<void>;
  isSaving?: boolean;
}

export function NotesSection({ initialNotes = '', onSave, isSaving = false }: Readonly<NotesSectionProps>) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);

  const handleSaveNotes = async () => {
    setSaved(false);
    await onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Notes</h3>
        <Textarea
          placeholder="Add your thoughts about this position..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 resize-none"
        />
        <Button
          onClick={handleSaveNotes}
          disabled={isSaving}
          className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Notes'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
