import { FilmAnimation } from "./film-animation";

const IMAGES_COUNT = 10;

function timeToImageIndex(imagesCount: number, time: number): number {
  return Math.floor(time / 100) % imagesCount;
}

export class StopGameAnimation extends FilmAnimation {
  isPlaying = false;

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = 0;
    const a = () => {
      const now = Date.now();
      if (!this.isPlaying) {
        return;
      }

      const currentImageIndex = timeToImageIndex(
        this.film.imagesSpriteContainer.children.length,
        now - start
      );
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
    return Math.max(
      3000,
      this.film.imagesSpriteContainer.children.length * 100
    );
  }

  needImagesLength(): number {
    return IMAGES_COUNT;
  }
}
