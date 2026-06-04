import type { FileDescriptorUploading } from "@/types";

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progreso de subida"}>
      <div className="progress-bar__fill" style={{ width: `${clamped}%` }} />
      <span className="progress-bar__text">{clamped}%</span>
    </div>
  );
}

export function isUploading(
  file: { status: string }
): file is FileDescriptorUploading {
  return file.status === "uploading";
}
