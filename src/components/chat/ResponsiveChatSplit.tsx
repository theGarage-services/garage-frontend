import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';
import { cn } from '../ui/utils';

interface ResponsiveChatSplitProps {
  /** When true on mobile, the detail pane is shown and the list is hidden. */
  detailSelected: boolean;
  /** Called from the mobile back button to return to the list. */
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * Responsive master/detail layout for chat screens.
 *
 * Desktop (md and up): a 1/3 split sidebar + detail grid.
 * Mobile: a drill-down where only the list or the detail is visible at a time,
 * with a back button to return to the list.
 */
export function ResponsiveChatSplit({
  detailSelected,
  onBack,
  children,
}: Readonly<ResponsiveChatSplitProps>) {
  const isMobile = useIsMobile();
  const elements = React.Children.toArray(children).filter(React.isValidElement);
  const listChild = elements[0];
  const detailChild = elements[1];

  if (!listChild || !detailChild) return null;

  // Treat undefined as desktop to avoid a layout flash on first render.
  const mobile = isMobile ?? false;

  return (
    <div className="grid md:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-220px)] md:h-[calc(100vh-280px)] min-w-0">
      <div
        className={cn(
          'md:col-span-1 h-full min-h-0 min-w-0',
          mobile && detailSelected && 'hidden'
        )}
      >
        {listChild}
      </div>
      <div
        className={cn(
          'md:col-span-3 h-full min-h-0 min-w-0 flex flex-col',
          mobile && !detailSelected && 'hidden'
        )}
      >
        {mobile && detailSelected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="self-start mb-2 -ml-2 text-gray-600 hover:text-[#ff6b35]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Button>
        )}
        <div className="flex-1 min-h-0">{detailChild}</div>
      </div>
    </div>
  );
}
