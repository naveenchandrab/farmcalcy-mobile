import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

export interface PickedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

interface UploadResponse {
  fileRef: string;
}

/**
 * Uploads a single Aadhaar image (front or back) as multipart/form-data and
 * returns the opaque server reference to store on the registration. The endpoint
 * is public + rate-limited (registration is pre-auth).
 */
export const uploadService = {
  async uploadAadhaar(image: PickedImage): Promise<string> {
    const form = new FormData();
    // React Native's FormData accepts this { uri, type, name } shape for file uploads.
    form.append('file', {
      uri: image.uri,
      type: image.type ?? 'image/jpeg',
      name: image.fileName ?? `aadhaar-${Date.now()}.jpg`,
    });

    const { data } = await apiClient.post<ApiResponse<UploadResponse>>('/uploads/aadhaar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.fileRef;
  },
};
