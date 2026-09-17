// Media helpers for the Content Studio admin.
// Browser-only APIs (canvas, Blob, File). Safe to import from client-only code paths.

import {toSlug} from './article';

const MAX_BYTES = 200 * 1024;
const MAX_DIMENSION = 2560;
const INITIAL_QUALITY = 0.84;
const MIN_QUALITY = 0.36;
const QUALITY_STEP = 0.08;

export function safeFilename(value: string): string {
  const dot = value.lastIndexOf('.');
  const stem = dot > 0 ? value.slice(0, dot) : value;
  return toSlug(stem).replace(/[\u4e00-\u9fff]/g, '') || 'image';
}

// Converts the input image file to a WebP Blob no greater than MAX_BYTES.
// Iteratively drops encoding quality until size target is met; throws if the
// result is still too large even at MIN_QUALITY.
export async function optimizeImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = INITIAL_QUALITY;
  let blob: Blob | null;
  do {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    quality -= QUALITY_STEP;
  } while (blob && blob.size > MAX_BYTES && quality >= MIN_QUALITY);
  if (!blob || blob.size > MAX_BYTES) {
    throw new Error('图片压缩后仍超过 200KB，请先裁剪后再上传。');
  }
  return blob;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}