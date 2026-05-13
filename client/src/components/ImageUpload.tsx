import React, { useState } from 'react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  uploadType: 'news' | 'officials';
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, uploadType }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8888/api/admin/upload?type=${uploadType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-3xl mb-2">📸</span>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG or GIF</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {uploading && (
        <div className="text-center text-sm text-blue-600 font-medium animate-pulse">
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
