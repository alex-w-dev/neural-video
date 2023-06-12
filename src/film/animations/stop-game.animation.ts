import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Text, TextStyle } from "pixi.js";
import { tween } from "@/src/utils/tween";
// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";

const IMAGES_COUNT = 3;

const frameTime = 100;

function timeToImageIndex(imagesCount: number, time: number): number {
  return Math.floor(time / frameTime) % imagesCount;
}

export class StopGameAnimation extends FilmAnimation {
  isPlaying = false;

  text1: Text;
  text1Y = 1920 * 0.09;
  text2: Text;
  text2Y = 1920 * 0.14;
  text3: Text;
  text3Y = 1920 * 0.12;

  constructor(protected film: Film) {
    super(film);

    this.text1 = this.getSubtitleText("Это игра:", { fontSize: 90 });
    this.text1.anchor.x = 0.5;
    this.text1.anchor.y = 0.5;
    this.text1.x = 1080 * 0.5;
    this.text1.y = this.text1Y;
    this.film.app.stage.addChild(this.text1);

    this.text2 = this.getSubtitleText("ставь на паузу и узнай...", {
      fontSize: 70,
    });
    this.text2.anchor.x = 0.5;
    this.text2.anchor.y = 0.5;
    this.text2.x = 1080 * 0.5;
    this.text2.y = this.text2Y;

    this.film.app.stage.addChild(this.text2);

    this.text3 = this.getSubtitleText(
      "Кто самый милый котик\nвселенной Марвел?",
      {
        fill: "#34cbfe",
        fontSize: 70,
      }
    );
    this.text3.anchor.x = 0.5;
    this.text3.anchor.y = 0.5;
    this.text3.x = 1080 * 0.5;
    this.text3.y = this.text3Y;

    this.film.app.stage.addChild(this.text3);

    this.hideTexts();
  }

  startTextAnimation() {
    this.hideTexts();

    const test3Time = 3000;
    const test2Time = 1000;
    const slideTop = 1920 * 0.1;
    const animationTime = 700;
    const easing = TWEEN.Easing.Cubic.InOut;

    this.text1.y = this.text2Y;
    tween({
      obj: this.text1,
      to: { alpha: 1 },
      duration: animationTime,
      easing,
    });
    tween({
      obj: this.text1,
      to: { y: this.text1Y },
      duration: animationTime,
      timeout: test2Time,
      easing,
    });
    tween({
      obj: this.text1,
      to: { alpha: 0, y: this.text1Y - slideTop },
      duration: animationTime,
      timeout: test3Time,
      easing,
    });

    this.text2.y = this.text2Y + slideTop;
    tween({
      obj: this.text2,
      to: { alpha: 1, y: this.text2Y },
      duration: animationTime,
      timeout: test2Time,
      easing,
    });
    tween({
      obj: this.text2,
      to: { alpha: 0, y: this.text2Y - slideTop },
      duration: animationTime,
      timeout: test3Time,
      easing,
    });

    this.text3.y = this.text3Y + slideTop;
    tween({
      obj: this.text3,
      to: { alpha: 1, y: this.text3Y },
      duration: animationTime,
      timeout: test3Time,
      easing,
    });
  }

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = 0;

    this.startTextAnimation();

    const a = () => {
      const now = Date.now();
      const currentTime = now - start;
      if (!this.isPlaying) {
        return;
      }

      const currentImageIndex = timeToImageIndex(
        this.film.imagesSpriteContainer.children.length,
        currentTime
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

  stop() {
    super.stop();

    this.hideTexts();
  }

  getTime(): number {
    let time = 0;
    while (time < 6000) {
      time += this.film.imagesSpriteContainer.children.length * frameTime;
    }

    return time;
  }

  needImagesLength(): number {
    return IMAGES_COUNT;
  }

  private hideTexts(): void {
    this.text1.alpha = 0;
    this.text2.alpha = 0;
    this.text3.alpha = 0;
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
