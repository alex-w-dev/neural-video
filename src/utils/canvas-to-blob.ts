export function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  mime: string = "image/jpeg"
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      console.log("blob.length", blob!.size);
      if (blob) {
        resolve(new File([blob!], fileName, { type: mime }));
      } else {
        reject("No Blob of Canvas");
      }
    }, mime);
  });
}
