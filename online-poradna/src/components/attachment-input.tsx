import React, { useEffect, useState } from 'react';
import styles from './attachment-input.module.css';

interface FileWithPreview {
  file: File;
  preview: string;
}

interface AttachmentInputProps {
  files: File[];
  onFilesSelected: (files: File[]) => void;
}

const AttachmentInput: React.FC<AttachmentInputProps> = ({ files, onFilesSelected }) => {
  const [filePreviews, setFilePreviews] = useState<FileWithPreview[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFilePreviews((prev) => [...prev, ...newFiles]);
      onFilesSelected(newFiles.map((fileWithPreview) => fileWithPreview.file));
    }
  };

  const handleRemoveFile = (fileToRemove: FileWithPreview, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    onFilesSelected(filePreviews.map((fwp) => fwp.file).filter((file) => file !== fileToRemove.file));
    setFilePreviews((prev) => prev.filter((file) => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  useEffect(() => {
    if (files.length === 0) {
      setFilePreviews([]);
    }
  }, [files]);

  return (
    <div className={styles.fileInputContainer}>
      <label htmlFor="file-input" className={styles.customFileInput}>
        vložit fotky
      </label>
      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        className={styles.input}
        multiple
        accept="image/*"
      />
      <div className={styles.previewContainer}>
        {filePreviews.map((fileWithPreview, index) => (
          <div key={index} className={styles.previewItem}>
            <img src={fileWithPreview.preview} alt={`Preview ${index}`} className={styles.previewImage} />
            <button className={styles.removeButton} onClick={(e) => handleRemoveFile(fileWithPreview, e)}>
              ✕
            </button>
            <p className={styles.fileName}>{fileWithPreview.file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentInput;
