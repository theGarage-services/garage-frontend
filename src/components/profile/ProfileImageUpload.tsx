import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { X, Upload, Crop as CropIcon } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

export function ProfileImageUpload({ currentImage, onUpload, onClose }: Readonly<ProfileImageUploadProps>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const getCroppedImage = useCallback(async (): Promise<File | null> => {
    if (!imageRef.current || !selectedFile || !completedCrop) return null;

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    
    // Use natural dimensions for high quality
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate pixel values from crop
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Set canvas to square dimensions (use smaller dimension to maintain aspect ratio)
    const size = Math.min(cropWidth, cropHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Center the crop in the square canvas
    const sourceX = cropX + (cropWidth - size) / 2;
    const sourceY = cropY + (cropHeight - size) / 2;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      size,
      size,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const croppedFile = new File([blob], selectedFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        },
        'image/jpeg',
        0.92
      );
    });
  }, [completedCrop, selectedFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      let fileToUpload = selectedFile;

      // If cropping is enabled, get the cropped image
      if (isCropping && crop.width !== 100 && crop.height !== 100) {
        const croppedFile = await getCroppedImage();
        if (croppedFile) {
          fileToUpload = croppedFile;
        }
      }

      await onUpload(fileToUpload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, isCropping, crop, onUpload, onClose, getCroppedImage]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

        <div className="space-y-4">
          {/* File Input */}
          <div className="flex justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Image
            </Button>
          </div>

        {/* Preview with Crop */}
        {previewUrl && isCropping && (
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="p-2 bg-gray-100 border-b flex items-center gap-2">
              <CropIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Drag to adjust crop area</span>
            </div>
            <div className="max-h-[400px] overflow-auto p-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
                keepSelection
                minWidth={100}
                minHeight={100}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto"
                  crossOrigin="anonymous"
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget;
                    const size = Math.min(width, height, 300);
                    const x = (width - size) / 2;
                    const y = (height - size) / 2;
                    const newCrop: Crop = {
                      unit: 'px',
                      x,
                      y,
                      width: size,
                      height: size,
                    };
                    setCrop(newCrop);
                    setCompletedCrop(newCrop);
                  }}
                />
              </ReactCrop>
            </div>
          </div>
        )}

        {/* Preview without crop */}
        {previewUrl && !isCropping && (
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b]"
            >
              {isUploading ? 'Uploading...' : 'Save Image'}
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  </div>
  );
}
