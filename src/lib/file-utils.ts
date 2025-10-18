import mime from 'mime-types'

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB per file
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB total per upload
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
}

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.videos,
  ...ALLOWED_FILE_TYPES.audio,
  ...ALLOWED_FILE_TYPES.archives,
]

// Format file size to human readable
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Validate file type
export function isValidFileType(mimeType: string): boolean {
  return ALL_ALLOWED_TYPES.includes(mimeType)
}

// Validate file size
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= FILE_SIZE_LIMITS.MAX_FILE_SIZE
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()
  return ext ? `.${ext.toLowerCase()}` : ''
}

// Get file category from mime type
export function getFileCategory(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other' {
  if (ALLOWED_FILE_TYPES.images.includes(mimeType)) return 'image'
  if (ALLOWED_FILE_TYPES.documents.includes(mimeType)) return 'document'
  if (ALLOWED_FILE_TYPES.videos.includes(mimeType)) return 'video'
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return 'audio'
  if (ALLOWED_FILE_TYPES.archives.includes(mimeType)) return 'archive'
  return 'other'
}

// Generate unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(originalFilename)
  const nameWithoutExt = originalFilename.replace(extension, '')
  
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`
}

// Sanitize filename (remove special characters)
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
}
