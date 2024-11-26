import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  multiple = false, 
  accept = "image/*,application/pdf", 
  className = "" 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFileSelect(filesArray);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        {/* Camera capture (mobile) */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>

        {/* File upload */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}