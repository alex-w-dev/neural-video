export function getFileNameFromPath(path: string): string {
  return path.replace(/^.*[\\/]/, "");
}
