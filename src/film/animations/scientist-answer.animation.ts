import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Text, TextStyle } from "pixi.js";
import { tween } from "@/src/utils/tween";
// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";
import { currentVideoStore } from "@/src/stores/current-video.store";

export class ScientistAnswerAnimation extends FilmAnimation {
  isPlaying = false;

  constructor(protected film: Film) {
    super(film);

    // this.film.app.stage.addChild();
  }

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = 0;

    const a = () => {
      const now = Date.now();
      const currentTime = now - start;
      if (!this.isPlaying) {
        return;
      }

      const currentImageIndex = Math.floor(
        (currentTime / currentVideoStore.audioDurationMs) *
          this.film.imagesSpriteContainer.children.length
      );

      this.film.imagesSpriteContainer.children.forEach(
        (child, index) => (child.renderable = index === currentImageIndex)
      );

      const needToChangeState = currentImageIndex !== lastRenderedImageIndex;

      if (needToChangeState) {
        console.log(
          currentVideoStore.audioDurationMs,
          "currentVideoStore.audioDurationMs"
        );
        console.log(currentTime, "currentTime");
        console.log(
          this.film.imagesSpriteContainer.children.length,
          "this.film.imagesSpriteContainer.children.length"
        );
        lastRenderedImageIndex = currentImageIndex;

        console.log("currentImageIndex");
        console.log(currentImageIndex);

        this.film.imagesSpriteContainer.children.forEach(
          (child, index) => (child.renderable = index === currentImageIndex)
        );
      }

      requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  }

  stop() {
    super.stop();
  }

  getTime(): number {
    return currentVideoStore.audioDurationMs;
  }

  needImagesLength(): number {
    return 0;
  }
}
