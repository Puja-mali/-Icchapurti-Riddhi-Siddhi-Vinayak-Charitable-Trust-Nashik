import crypto from 'crypto';
import path from 'path';

export type FileCategory = 'IMAGE' | 'DOCUMENT';

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  DOCUMENT: 10 * 1024 * 1024, // 10 MB
} as const;

export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_DOCUMENT_MIMES = ['application/pdf'] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf'] as const;

export interface FileValidationResult {
  isValid: boolean;
  detectedMime?: string;
  extension?: string;
  error?: string;
}

/**
 * Validates the raw magic byte signature of a file buffer.
 * Does not trust user-supplied extension or browser Content-Type.
 */
export function validateFileSignature(
  buffer: Buffer,
  category: FileCategory
): FileValidationResult {
  if (!buffer || buffer.length < 8) {
    return { isValid: false, error: 'File buffer is empty or too small to inspect' };
  }

  // 1. Check for executable or script signatures (Instant Rejection)
  // DOS / Windows PE executable: 'MZ' (0x4D 0x5A)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { isValid: false, error: 'Executable files (.exe/.dll) are strictly prohibited' };
  }

  // Linux ELF executable: 0x7F 'ELF'
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { isValid: false, error: 'ELF binary executables are strictly prohibited' };
  }

  // Java class file: 0xCA 0xFE 0xBA 0xBE
  if (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe) {
    return { isValid: false, error: 'Compiled binary files are prohibited' };
  }

  // Script or HTML detection in the first 512 bytes
  const headerSample = buffer.slice(0, Math.min(buffer.length, 512)).toString('utf8').toLowerCase();
  if (
    headerSample.includes('<script') ||
    headerSample.includes('<html') ||
    headerSample.includes('<?php') ||
    headerSample.includes('<svg') ||
    headerSample.includes('<!doctype')
  ) {
    return { isValid: false, error: 'Scripts, HTML, and SVG markup are strictly prohibited in uploads' };
  }

  // 2. Validate expected format signatures
  if (category === 'IMAGE') {
    // JPEG: 0xFF 0xD8 0xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { isValid: true, detectedMime: 'image/jpeg', extension: '.jpg' };
    }

    // PNG: 0x89 'PNG' 0x0D 0x0A 0x1A 0x0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { isValid: true, detectedMime: 'image/png', extension: '.png' };
    }

    // WebP: RIFF (0x52 0x49 0x46 0x46) .... WEBP (0x57 0x45 0x42 0x50) at offset 8-11
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { isValid: true, detectedMime: 'image/webp', extension: '.webp' };
    }

    return {
      isValid: false,
      error: 'Invalid image format. Only authentic JPEG, PNG, and WebP images are permitted',
    };
  }

  if (category === 'DOCUMENT') {
    // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return { isValid: true, detectedMime: 'application/pdf', extension: '.pdf' };
    }

    return {
      isValid: false,
      error: 'Invalid document format. Only authentic PDF documents are permitted',
    };
  }

  return { isValid: false, error: 'Unsupported file category' };
}

/**
 * Sanitizes original filename and generates a cryptographically secure, non-colliding filename.
 * Prevents directory traversal (`../`), null-byte poisoning, and arbitrary extension tricks.
 */
export function generateSafeStoredFilename(
  originalFilename: string,
  verifiedExtension: string
): { safeFilename: string; sanitizedOriginal: string } {
  // Strip paths, null bytes, and control characters
  const basename = path.basename(originalFilename).replace(/\0/g, '');
  const sanitizedOriginal = basename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);

  // Generate cryptographically unique file token
  const randomToken = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const safeFilename = `${timestamp}-${randomToken}${verifiedExtension}`;

  return { safeFilename, sanitizedOriginal };
}

/**
 * Validates and sanitizes media URLs provided for images or transparency reports.
 * Prevents XSS via javascript: or data: URIs, SSRF to private/internal IPs, and executable links.
 */
export function validateAndSanitizeMediaUrl(
  inputUrl: string,
  type: 'IMAGE' | 'DOCUMENT'
): { isValid: boolean; sanitizedUrl: string; error?: string } {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isValid: false, sanitizedUrl: '', error: 'URL is required' };
  }

  const trimmed = inputUrl.trim();

  // Reject immediate dangerous protocol prefixes
  const lowercase = trimmed.toLowerCase();
  if (
    lowercase.startsWith('javascript:') ||
    lowercase.startsWith('data:') ||
    lowercase.startsWith('vbscript:') ||
    lowercase.startsWith('file:') ||
    lowercase.startsWith('ftp:') ||
    lowercase.startsWith('blob:')
  ) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Unsafe URL protocol detected. Only secure http and https links are permitted',
    };
  }

  // Allow relative verified upload paths (e.g. /api/uploads/:id)
  if (trimmed.startsWith('/api/uploads/')) {
    if (trimmed.includes('..') || trimmed.includes('\\') || trimmed.includes('\0')) {
      return { isValid: false, sanitizedUrl: '', error: 'Path traversal detected in media path' };
    }
    return { isValid: true, sanitizedUrl: trimmed };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, sanitizedUrl: '', error: 'Invalid URL format' };
  }

  // Enforce http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: `Protocol "${parsed.protocol}" is not supported. Use http or https`,
    };
  }

  // SSRF Protection: Block localhost, 127.0.0.1, 169.254.169.254 (metadata service), internal ranges
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '169.254.169.254' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    (hostname.startsWith('172.') && parseInt(hostname.split('.')[1] || '0', 10) >= 16 && parseInt(hostname.split('.')[1] || '0', 10) <= 31)
  ) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Access to internal or loopback IP addresses is strictly blocked',
    };
  }

  // Path inspection: Reject executable or script extensions
  const pathname = parsed.pathname.toLowerCase();
  const dangerousExtensions = [
    '.exe', '.sh', '.bat', '.cmd', '.bin', '.msi',
    '.php', '.js', '.mjs', '.ts', '.py', '.rb', '.pl',
    '.html', '.htm', '.xhtml', '.svg', '.xml',
  ];

  for (const ext of dangerousExtensions) {
    if (pathname.endsWith(ext)) {
      return {
        isValid: false,
        sanitizedUrl: '',
        error: `URL contains forbidden file extension "${ext}"`,
      };
    }
  }

  // Category specific checks
  if (type === 'DOCUMENT') {
    // If it is a direct file path, it should end with .pdf or be a trusted Cloudinary/storage URL
    const isPdf = pathname.endsWith('.pdf');
    const isKnownStorage = hostname.includes('cloudinary.com') || hostname.includes('drive.google.com') || hostname.includes('storage.googleapis.com');
    if (!isPdf && !isKnownStorage && !pathname.includes('/pdf/')) {
      return {
        isValid: false,
        sanitizedUrl: '',
        error: 'Document URL must point to a valid PDF resource (.pdf)',
      };
    }
  }

  return { isValid: true, sanitizedUrl: parsed.toString() };
}
