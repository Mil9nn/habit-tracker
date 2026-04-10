import { cloudinaryConfig } from "./cloudinary";
import axios from 'axios';

// Get cloud name from cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

const uploadPreset = 'progress_photos';

export const uploadImage = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'progress-timeline');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = response.data;
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
    throw error;
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const timestamp = Date.now();
    const signature = cloudinaryConfig.utils.api_sign_request({
      timestamp: timestamp,
      public_id: publicId,
      action: 'destroy'
    });

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        public_id: publicId,
        signature: signature.signature,
        timestamp: timestamp,
        api_key: process.env.CLOUDINARY_API_KEY
      }
    );

    const data = response.data;
    if (data.result !== 'ok') {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to delete image');
    }
    throw error;
  }
};
