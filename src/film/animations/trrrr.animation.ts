import { FilmAnimation } from "./film-animation";

const imageTimeEnds: number[] = [];
for (let i = 0; i < 14; i++) {
  imageTimeEnds.push(100 + i * 100);
}

const IMAGES_COUNT = imageTimeEnds.length;

console.log("imageTimeEnds", imageTimeEnds);

function timeToImageIndex(time: number): number {
  for (const imageTimeEnd of imageTimeEnds) {
    if (time < imageTimeEnd) {
      return imageTimeEnds.indexOf(imageTimeEnd);
    }
  }

  return Math.max(imageTimeEnds.length - 1, 0);
}

export class TrrrrAnimation extends FilmAnimation {
  isPlaying = false;

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = 0;
    const a = () => {
      const now = Date.now();
      if (!this.isPlaying) {
        console.log("99", 99);
        return;
      }

      const currentImageIndex = timeToImageIndex(now - start);
      if (currentImageIndex !== lastRenderedImageIndex) {
        this.film.imagesSpriteContainer.children.forEach(
          (child, index) => (child.renderable = index === currentImageIndex)
        );
        lastRenderedImageIndex = currentImageIndex;
      }

      requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  }

  getTime(): number {
    return 4100;
  }

  needImagesLength(): number {
    return IMAGES_COUNT;
  }
}
