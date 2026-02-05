import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.includes("pdf")) return "FileText";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "FileText";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "Sheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Presentation";
  return "File";
}
