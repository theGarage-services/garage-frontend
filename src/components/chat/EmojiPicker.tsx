"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Smile } from "lucide-react";
import Picker, { Theme, SkinTones, EmojiStyle } from "emoji-picker-react";
import type { EmojiClickData, SkinTones as SkinTonesType } from "emoji-picker-react";

const SKIN_TONE_KEY = "kazi-emoji-skin-tone";

function readStoredSkinTone(): SkinTonesType {
  if (globalThis.window === undefined) return SkinTones.NEUTRAL;
  const raw = globalThis.localStorage.getItem(SKIN_TONE_KEY);
  if (raw === null) return SkinTones.NEUTRAL;
  const parsed = Number(raw);
  const validValues = Object.values(SkinTones).filter((v): v is SkinTonesType => typeof v === 'number');
  return validValues.includes(parsed as unknown as SkinTonesType) ? (parsed as unknown as SkinTonesType) : SkinTones.NEUTRAL;
}

function saveSkinTone(tone: SkinTonesType): void {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.setItem(SKIN_TONE_KEY, String(tone));
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: Readonly<EmojiPickerProps>) {
  const [open, setOpen] = useState(false);
  const [skinTone, setSkinTone] = useState<SkinTonesType>(readStoredSkinTone);

  useEffect(() => {
    setSkinTone(readStoredSkinTone());
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  const handleSkinToneChange = (tone: SkinTonesType) => {
    setSkinTone(tone);
    saveSkinTone(tone);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 shadow-lg" align="end">
        <Picker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          theme={Theme.LIGHT}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonesDisabled={false}
          defaultSkinTone={skinTone}
          onSkinToneChange={handleSkinToneChange}
          width={350}
          height={400}
          searchPlaceholder="Search emoji..."
        />
      </PopoverContent>
    </Popover>
  );
}