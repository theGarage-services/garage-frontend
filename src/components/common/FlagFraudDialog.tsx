import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Flag } from 'lucide-react';

interface FlagFraudDialogProps {
  title: string;
  description: string;
  onConfirm: (reason: string) => void | Promise<void>;
  buttonSize?: 'sm' | 'default' | 'lg' | 'icon';
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  buttonText?: string;
  className?: string;
}

export function FlagFraudDialog({
  title,
  description,
  onConfirm,
  buttonSize = 'sm',
  buttonVariant = 'outline',
  buttonText = 'Flag as fraud',
  className,
}: Readonly<FlagFraudDialogProps>) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(reason.trim());
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setReason('');
      }, 1200);
    } catch (error: any) {
      alert(error.message || 'Failed to submit flag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={buttonSize}
          variant={buttonVariant}
          className={className}
          onClick={() => setOpen(true)}
        >
          <Flag className="w-4 h-4 mr-1" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {done ? (
          <p className="text-green-600 font-medium">Flag submitted successfully.</p>
        ) : (
          <Textarea
            placeholder="Optional reason (e.g., fake job posting, misleading details...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        )}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          {!done && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Submitting...' : 'Confirm flag'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
