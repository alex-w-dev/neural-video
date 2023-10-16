import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Sprite, Text, TextStyle } from "pixi.js";
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

  playGptAddAnimation() {
    const y = 0.5;
    const sprite = Sprite.from(
      "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
    );
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.x = 1080 * 0.7;
    sprite.y = 1920 * (0.15 + y);
    sprite.scale.set(0.8);
    sprite.renderable = false;
    this.film.app.stage.addChild(sprite);

    const neuralText = this.getSubtitleText("нейросеть", {
      fontSize: 55,
      fill: "#75ac9d",
    });
    neuralText.anchor.x = 0.5;
    neuralText.anchor.y = 0.5;
    neuralText.x = 1080 * 0.7;
    neuralText.y = 1920 * (0.2 + y);
    neuralText.renderable = false;
    this.film.app.stage.addChild(neuralText);

    const inCommentsText = this.getSubtitleText("в комментариях", {
      fontSize: 55,
      fill: "#75ac9d",
    });
    inCommentsText.anchor.x = 0.5;
    inCommentsText.anchor.y = 0.5;
    inCommentsText.x = 1080 * 0.7;
    inCommentsText.y = 1920 * (0.2 + y);
    inCommentsText.renderable = false;
    this.film.app.stage.addChild(inCommentsText);

    let i = 0;
    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
      }
      if (i < 2 || i > 5 || !this.isPlaying) {
        neuralText.renderable = false;
        inCommentsText.renderable = false;
        sprite.renderable = false;
      } else {
        const odd = i % 2;
        neuralText.renderable = !odd;
        inCommentsText.renderable = !!odd;
        sprite.renderable = true;
      }
      i++;
    }, 500);
  }

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = 0;

    this.playGptAddAnimation();
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

  private getSubtitleText(text: string, textStyle: Partial<TextStyle>): Text {
    const style = new TextStyle({
      align: "center",
      dropShadow: true,
      dropShadowAlpha: 0.6,
      dropShadowAngle: -2.2,
      dropShadowBlur: 8,
      dropShadowDistance: 0,
      fill: "#feaa34",
      fontFamily: "Comic Sans MS",
      fontSize: 70,
      fontWeight: "bold",
      lineJoin: "round",
      miterLimit: 11,
      strokeThickness: 7,
      wordWrap: false,
      ...textStyle,
    });
    return new Text(text, style);
  }
}
