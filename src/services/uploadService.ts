import { apiClient } from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    isPublic?: boolean;
  };
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

/**
 * Validates file on client side for immediate user UX feedback before network dispatch.
 * (Note: Server performs authoritative deep binary magic-byte inspection).
 */
export function validateClientFile(
  file: File,
  type: 'IMAGE' | 'DOCUMENT'
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const maxSize = type === 'IMAGE' ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
  const maxMb = type === 'IMAGE' ? '5 MB' : '10 MB';

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${maxMb}.`,
    };
  }

  if (type === 'IMAGE') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are permitted.',
      };
    }
  } else if (type === 'DOCUMENT') {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        error: 'Invalid file type. Only authentic PDF documents (.pdf) are permitted.',
      };
    }
  }

  return { isValid: true };
}

export const uploadService = {
  /**
   * Upload an authorized image (Causes, Events, Blog, Gallery, Trustee profile).
   */
  async uploadImage(file: File): Promise<UploadResponse['data']> {
    const validation = validateClientFile(file, 'IMAGE');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient<UploadResponse>('/uploads/image', {
      method: 'POST',
      body: formData,
    });

    if (!res || !res.success || !res.data?.url) {
      throw new Error(res?.message || 'Failed to upload image');
    }

    return res.data;
  },

  /**
   * Upload a public transparency report PDF.
   */
  async uploadReport(file: File): Promise<UploadResponse['data']> {
    const validation = validateClientFile(file, 'DOCUMENT');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient<UploadResponse>('/uploads/report', {
      method: 'POST',
      body: formData,
    });

    if (!res || !res.success || !res.data?.url) {
      throw new Error(res?.message || 'Failed to upload document');
    }

    return res.data;
  },

  /**
   * Upload a private applicant document (e.g. proof of income or medical certificate).
   */
  async uploadPrivateDocument(file: File): Promise<UploadResponse['data']> {
    // Allows either PDF or image
    const isImage = file.type.startsWith('image/');
    const validation = validateClientFile(file, isImage ? 'IMAGE' : 'DOCUMENT');
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient<UploadResponse>('/uploads/document', {
      method: 'POST',
      body: formData,
    });

    if (!res || !res.success || !res.data?.url) {
      throw new Error(res?.message || 'Failed to upload document');
    }

    return res.data;
  },

  /**
   * Delete an uploaded asset (Authorized for owner or admin).
   */
  async deleteAsset(identifier: string): Promise<void> {
    await apiClient(`/uploads/${identifier}`, {
      method: 'DELETE',
    });
  },
};
