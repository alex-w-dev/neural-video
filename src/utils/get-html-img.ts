export function getHtmlImg(src: string): HTMLImageElement {
  const img = document.createElement("img");
  img.crossOrigin = "anonymous";
  img.src = src;

  return img;
}

export function getHtmlImgPromise(src: string): Promise<HTMLImageElement> {
  const img = getHtmlImg(src);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
  });
}
