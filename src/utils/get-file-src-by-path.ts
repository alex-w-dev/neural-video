export function getFileSrcByPath(path: string): string {
  return `http://localhost:3000/api/get-file?path=${path}`;
}
