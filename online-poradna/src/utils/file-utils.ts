import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Převod fotografií na WebP formát.
 */
const convertImageToWebP = async (
  file: File,
  options: { maxWidth: number; maxHeight: number }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleFactor = Math.min(
          options.maxWidth / img.width,
          options.maxHeight / img.height,
          1
        );
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob)
              return reject(new Error('Failed to convert image to WebP'));
            resolve(blob);
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      if (event.target?.result) img.src = event.target.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Nahrání a transformace souboru do webp a vytvoření URL.
 */
export const uploadAndTransformFiles = async (file: File, basePath: string) => {
  const uniqueId = uuidv4();

  const originalRef = ref(
    storage,
    `${basePath}/original/${uniqueId}_${file.name}`
  );
  await uploadBytesResumable(originalRef, file);
  const originalUrl = await getDownloadURL(originalRef);

  const fullWebPBlob = await convertImageToWebP(file, {
    maxWidth: Infinity,
    maxHeight: Infinity,
  });
  const fullWebPRef = ref(
    storage,
    `${basePath}/fullwebp/${uniqueId}_${file.name.replace(/\.[^/.]+$/, '')}.webp`
  );
  await uploadBytesResumable(fullWebPRef, fullWebPBlob);
  const fullImageUrl = await getDownloadURL(fullWebPRef);

  const thumbBlob = await convertImageToWebP(file, {
    maxWidth: 400,
    maxHeight: 400,
  });
  const thumbRef = ref(
    storage,
    `${basePath}/thumbs/${uniqueId}_${file.name.replace(/\.[^/.]+$/, '')}_thumb.webp`
  );
  await uploadBytesResumable(thumbRef, thumbBlob);
  const thumbnailUrl = await getDownloadURL(thumbRef);

  return { originalUrl, fullImageUrl, thumbnailUrl };
};
