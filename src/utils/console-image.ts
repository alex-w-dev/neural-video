export function consoleImage(url: string, size = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";
    image.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      // Copy the image contents to the canvas
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve();
        return console.log("No ctx for render image");
      }

      ctx.drawImage(image, 0, 0);

      // Get the data-URL formatted image
      // Firefox supports PNG and JPEG. You could check img.src to
      // guess the original format, but be aware the using "image/jpg"
      // will re-encode the image.
      var dataURL = canvas.toDataURL("image/png");

      console.log(
        "%c ",
        `font-size: 1px; padding: ${size}px; background: url(${dataURL}) center center no-repeat; background-size: contain;`
      );
      resolve();
    };
    image.onerror = reject;
  });
}
