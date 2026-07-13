import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Video, Mic, RotateCcw, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export interface VideoPromptRecorderProps {
  questionText: string;
  maxDurationSeconds: number;
  onUpload: (blob: Blob, durationSeconds: number) => Promise<void>;
  isUploading?: boolean;
  uploadError?: string | null;
  retakeCount?: number;
  maxRetakes?: number;
}

type RecorderState = 'idle' | 'recording' | 'preview' | 'uploaded' | 'error';

export function VideoPromptRecorder({
  questionText,
  maxDurationSeconds,
  onUpload,
  isUploading = false,
  uploadError = null,
  retakeCount = 0,
  maxRetakes = 3,
}: Readonly<VideoPromptRecorderProps>) {
  const [state, setState] = useState<RecorderState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);
  const recordingStartRef = useRef<number>(0);
  const countdownRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);

  const remainingTime = Math.max(0, maxDurationSeconds - elapsedSeconds);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopStream();
    if (timerRef.current) {
      globalThis.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      globalThis.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [stopStream]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startPreview = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera and microphone access are required to record video responses.');
      setState('error');
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await startPreview();
    }
    if (!streamRef.current) return;

    chunksRef.current = [];
    setElapsedSeconds(0);
    setRecordedBlob(null);
    setRecordedDuration(0);
    setCountdown(3);

    countdownRef.current = globalThis.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            globalThis.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          beginRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginRecording = () => {
    if (!streamRef.current) return;

    const mimeType = getSupportedMimeType();
    try {
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        const duration = (globalThis.Date.now() - recordingStartRef.current) / 1000;
        stopStream();
        setRecordedBlob(blob);
        setRecordedDuration(duration);
        setState('preview');
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
          videoRef.current.muted = false;
          videoRef.current.load();
        }
      };

      recorder.onerror = () => {
        setCameraError('Recording failed. Please try again.');
        setState('error');
      };

      recordingStartRef.current = globalThis.Date.now();
      recorder.start();
      setState('recording');

      timerRef.current = globalThis.setInterval(() => {
        const elapsed = (globalThis.Date.now() - recordingStartRef.current) / 1000;
        setElapsedSeconds(elapsed);
        if (elapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 500);
    } catch (err) {
      console.error('Recording failed to start:', err);
      setCameraError('Could not start recording. Please try again.');
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      globalThis.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRetake = () => {
    if (retakeCount >= maxRetakes) return;
    setRecordedBlob(null);
    setRecordedDuration(0);
    setElapsedSeconds(0);
    setState('idle');
    startPreview();
  };

  const handleUpload = async () => {
    if (!recordedBlob) return;
    await onUpload(recordedBlob, recordedDuration);
    setState('uploaded');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canRetake = retakeCount < maxRetakes;
  const isLimitReached = retakeCount >= maxRetakes;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Question</h3>
          <p className="text-gray-700">{questionText}</p>
          <p className="text-sm text-gray-500 mt-1">
            Max {formatTime(maxDurationSeconds)} · {canRetake ? `${maxRetakes - retakeCount} retake${maxRetakes - retakeCount === 1 ? '' : 's'} left` : 'No retakes left'}
          </p>
        </div>
      </div>

      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay={state === 'idle' || state === 'recording'}
          playsInline
          loop={false}
          controls={state === 'preview' || state === 'uploaded'}
          className="w-full h-full object-cover"
        >
          <track kind="captions" src="" label="No captions" default />
        </video>

        {state === 'idle' && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
            <Video className="w-12 h-12" />
            <p className="text-sm">Camera preview will appear here</p>
          </div>
        )}

        {state === 'recording' && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium">{formatTime(remainingTime)}</span>
          </div>
        )}

        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <span className="text-6xl font-bold">{countdown}</span>
          </div>
        )}

        {(cameraError || uploadError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-6 text-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm">{cameraError || uploadError}</p>
            <Button variant="outline" onClick={startPreview} className="text-white border-white hover:bg-white/10">
              Retry Camera
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mic className="w-4 h-4" />
          <span>Microphone required</span>
        </div>

        <RecorderActions
          state={state}
          canRetake={canRetake}
          isUploading={isUploading}
          isLimitReached={isLimitReached}
          countdown={countdown}
          onStart={startRecording}
          onStop={stopRecording}
          onRetake={handleRetake}
          onUpload={handleUpload}
        />
      </div>

      {isLimitReached && state === 'preview' && (
        <p className="text-sm text-amber-600">
          Retake limit reached. Please upload this take to continue.
        </p>
      )}
    </Card>
  );
}

function RecorderActions({
  state,
  canRetake,
  isUploading,
  isLimitReached,
  countdown,
  onStart,
  onStop,
  onRetake,
  onUpload,
}: Readonly<{
  state: RecorderState;
  canRetake: boolean;
  isUploading: boolean;
  isLimitReached: boolean;
  countdown: number;
  onStart: () => void;
  onStop: () => void;
  onRetake: () => void;
  onUpload: () => void;
}>) {
  if (state === 'idle' || state === 'error') {
    return (
      <Button onClick={onStart} disabled={isUploading || countdown > 0}>
        <Video className="w-4 h-4 mr-2" />
        Start Recording
      </Button>
    );
  }

  if (state === 'recording') {
    return (
      <Button onClick={onStop} variant="destructive">
        Stop Recording
      </Button>
    );
  }

  if (state === 'preview') {
    return (
      <>
        {canRetake && (
          <Button variant="outline" onClick={onRetake} disabled={isUploading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
        )}
        <Button onClick={onUpload} disabled={isUploading || isLimitReached}>
          {isUploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Use This Take
            </>
          )}
        </Button>
      </>
    );
  }

  if (state === 'uploaded') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Response saved</span>
      </div>
    );
  }

  return null;
}

function getSupportedMimeType(): string | null {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}
