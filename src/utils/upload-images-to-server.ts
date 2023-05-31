export const uploadImagesToServer = (
  files: FileList | File[]
): Promise<string[]> => {
  return Promise.all(
    Array.from(files).map((file) => {
      let formData = new FormData();
      formData.append("files", file);
      return fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })
        .then((d) => d.json())
        .then((d) => d.data as string);
    })
  );
};
