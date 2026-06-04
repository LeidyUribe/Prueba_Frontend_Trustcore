import type { FileDescriptorIdle } from "@/types";

/**
 * Builds a deduplication key from name + size.
 * Chosen over name-only to allow same-named files with different content,
 * and over hash because hashing is async and expensive for large files.
 */
function buildDedupeKey(name: string, size: number): string {
  return `${name}::${size}`;
}

function isFileList(input: FileList | File[]): input is FileList {
  return typeof (input as FileList).item === "function";
}

function toFileArray(files: FileList | File[]): File[] {
  if (isFileList(files)) {
    return Array.from(files);
  }
  return files;
}

/**
 * Converts browser File objects into idle FileDescriptors,
 * removing duplicates by name + size.
 *
 * Time:  O(n) — single pass with Set lookup
 * Space: O(n) — Set keys + result array
 */
export function mapFilesToDescriptors(
  files: FileList | File[]
): FileDescriptorIdle[] {
  const fileArray = toFileArray(files);
  const seen = new Set<string>();
  const result: FileDescriptorIdle[] = [];

  for (const file of fileArray) {
    const key = buildDedupeKey(file.name, file.size);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      status: "idle",
      file,
    });
  }

  return result;
}
