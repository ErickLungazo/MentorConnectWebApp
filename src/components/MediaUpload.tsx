import React, { useCallback, useState } from "react";
import { DropzoneState, useDropzone } from "react-dropzone";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID
import { Progress } from "@/components/ui/progress"; // ✅ ShadCN UI Progress Bar
import { File, UploadCloud } from "lucide-react";
import { getRagURL } from "@/lib/utils.ts";

// ✅ Define Props Interface
interface MediaUploadProps {
  setFileURL: (url: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ setFileURL }) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]; // Only handle one file
      if (!file) return;

      // ✅ Extract original file extension
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`; // ✅ Generate new filename

      setFileName(uniqueFileName);
      setUploadProgress(0);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file, uniqueFileName); // ✅ Rename file before uploading

      try {
        const response = await axios.post<{ file_url: string }>(
          `${getRagURL()}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress(percent);
              }
            },
          },
        );

        // ✅ Set the uploaded file URL in parent state
        setFileURL(response.data.file_url);
      } catch (error) {
        setUploadError(
          error.response?.data?.error || "Upload failed. Please try again.",
        );
      }
    },
    [setFileURL],
  );

  const { getRootProps, getInputProps, isDragActive }: DropzoneState =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "text/plain": [".txt", ".md", ".csv"],
      },
      maxFiles: 1,
    });

  return (
    <div className="w-full mx-auto py-2">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the file here...</p>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud size={40} className="text-gray-500" />
            <p className="text-gray-700 mt-2">
              Drag & Drop your file here, or click to select
            </p>
            <small className="text-gray-500">
              Supported: PDF, TXT, MD, CSV
            </small>
          </div>
        )}
      </div>

      {/* File Name */}
      {fileName && (
        <div className="mt-4 flex items-center space-x-2">
          <File size={20} className="text-gray-600" />
          <span className="text-gray-700">{fileName}</span>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploadProgress > 0 && (
        <Progress value={uploadProgress} className="mt-4" />
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <p className="text-green-600 text-sm mt-2">
          File uploaded successfully!
        </p>
      )}
    </div>
  );
};

export default MediaUpload;
