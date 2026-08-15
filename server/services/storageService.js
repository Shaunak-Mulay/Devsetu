import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export class StorageService {
  /**
   * Upload a base64 encoded image string to a Supabase Storage bucket
   * @param {string} base64Data - Data URL or raw base64 string
   * @param {string} bucketName - Target bucket (e.g., 'booking-receipts', 'support-attachments')
   * @param {string} fileName - Destination filename
   * @returns {Promise<string>} - Public URL of the uploaded image
   */
  static async uploadBase64(base64Data, bucketName = 'booking-receipts', fileName) {
    if (!base64Data) return null;
    if (!isSupabaseConfigured()) {
      // If Supabase not yet configured, return original base64 to avoid data loss
      return base64Data;
    }

    try {
      let mimeType = 'image/png';
      let cleanBase64 = base64Data;

      // Extract mime type if it's a data URL format
      if (base64Data.startsWith('data:')) {
        const parts = base64Data.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        cleanBase64 = parts[1];
      }

      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = mimeType.split('/')[1] || 'png';
      const path = `${fileName || `upload_${Date.now()}`}.${ext}`;

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(path, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        console.error(`[StorageService] Upload failed to ${bucketName}/${path}:`, error.message);
        return base64Data; // Fallback to raw string if storage upload encounters error
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(path);

      console.log(`[StorageService] Uploaded successfully: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('[StorageService] Error processing base64 upload:', err.message);
      return base64Data;
    }
  }

  /**
   * Delete a file from a Supabase Storage bucket
   */
  static async deleteFile(fileUrl, bucketName = 'booking-receipts') {
    if (!fileUrl || !isSupabaseConfigured()) return;
    try {
      // Extract file path from URL
      const urlObj = new URL(fileUrl);
      const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucketName}/`);
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1]);
        await supabaseAdmin.storage.from(bucketName).remove([filePath]);
        console.log(`[StorageService] Deleted ${bucketName}/${filePath}`);
      }
    } catch (err) {
      console.error('[StorageService] Error deleting file:', err.message);
    }
  }
}
