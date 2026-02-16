import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip path traversal sequences, separators, and null bytes from a file name. */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/\0/g, '')       // null bytes
    .replace(/\.\./g, '')     // path traversal
    .replace(/[/\\]/g, '_')   // path separators
    .trim() || 'file'
}
