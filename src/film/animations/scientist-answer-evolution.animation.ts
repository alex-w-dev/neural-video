import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Sprite, Text, TextStyle } from "pixi.js";
import { tween } from "@/src/utils/tween";
// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";
import { currentVideoStore } from "@/src/stores/current-video.store";
import { Fragment } from "@/src/stores/fragment.interface";
import { getHtmlImgPromise } from "@/src/utils/get-html-img";

export class ScientistAnswerEvolutionAnimation extends FilmAnimation {
  isPlaying = false;

  imgSrcToSprite = new Map<string, Sprite>();

  constructor(protected film: Film) {
    super(film);
  }

  async registerImgAsSprite(src: string): Promise<void> {
    const sprite = this.film.getSpriteFromImg(await getHtmlImgPromise(src));
    sprite.renderable = false;
    this.imgSrcToSprite.set(src, sprite);
  }
  async switchOnFragment(fragment: Fragment): Promise<void> {
    if (!fragment.transitPreImages) {
      this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
      return;
    }

    const otherSprites = fragment.transitPreImages.map((img) =>
      this.imgSrcToSprite.get(img.src)
    );
    let currenSprite: Sprite | undefined;
    const nextStep = () => {
      if (currenSprite) {
        currenSprite.renderable = false;
      }
      currenSprite = otherSprites.shift();
      if (currenSprite) {
        currenSprite.renderable = true;
      }
    };

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!otherSprites.length) {
          if (currenSprite) {
            currenSprite.renderable = false;
          }

          this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
          clearInterval(interval);
          resolve();
        } else {
          nextStep();
        }
      }, 100);
      nextStep();
    });
  }

  async switchOffFragment(fragment: Fragment): Promise<void> {
    this.imgSrcToSprite.get(fragment.image!.src)!.renderable = false;

    if (!fragment.transitPostImages) {
      return;
    }

    const otherSprites = fragment.transitPostImages.map((img) =>
      this.imgSrcToSprite.get(img.src)
    );
    let currenSprite: Sprite | undefined;
    const nextStep = () => {
      if (currenSprite) {
        currenSprite.renderable = false;
      }
      currenSprite = otherSprites.shift();
      if (currenSprite) {
        currenSprite.renderable = true;
      }
    };

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!otherSprites.length) {
          if (currenSprite) {
            currenSprite.renderable = false;
          }

          clearInterval(interval);
          resolve();
        } else {
          nextStep();
        }
      }, 100);
      nextStep();
    });
  }

  async beforePlay(): Promise<void> {
    console.log(`before`, "`before`");
    // this.film.app.stage.addChild();
    const allPromises: Promise<void>[] = [];
    for (const fragment of currentVideoStore.fragments) {
      allPromises.push(this.registerImgAsSprite(fragment.image?.src!));

      for (const transitPreImage of fragment.transitPreImages || []) {
        allPromises.push(this.registerImgAsSprite(transitPreImage.src));
      }

      for (const transitPostImage of fragment.transitPostImages || []) {
        allPromises.push(this.registerImgAsSprite(transitPostImage.src));
      }
    }

    await Promise.all(allPromises);

    this.imgSrcToSprite.forEach((sprite) => {
      sprite.renderable = false;
      this.film.app.stage.addChild(sprite);
    });
    console.log(`paly`, "`paly`");
  }

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = -1;
    const timeOffset =
      (((currentVideoStore.fragments[0].transitPreImages?.length || 0) +
        (currentVideoStore.fragments[0].transitPostImages?.length || 0)) *
        100) /
      2;

    const a = async () => {
      const now = Date.now() + timeOffset;
      const currentTime = now - start;
      if (!this.isPlaying) {
        return;
      }

      const currentImageIndex = Math.floor(
        (currentTime / currentVideoStore.audioDurationMs) *
          this.film.imagesSpriteContainer.children.length
      );

      // this.film.imagesSpriteContainer.children.forEach(
      //   (child, index) => (child.renderable = index === currentImageIndex)
      // );

      const needToChangeState = currentImageIndex !== lastRenderedImageIndex;

      if (needToChangeState) {
        lastRenderedImageIndex = currentImageIndex;
        const prevFragment = currentVideoStore.fragments[currentImageIndex - 1];
        if (prevFragment) {
          await this.switchOffFragment(prevFragment);
        }
        const fragment =
          currentVideoStore.fragments[currentImageIndex] ||
          currentVideoStore.fragments[0];
        if (fragment && currentImageIndex !== 0) {
          await this.switchOnFragment(fragment);
        }
        // console.log(
        //   currentVideoStore.audioDurationMs,
        //   "currentVideoStore.audioDurationMs"
        // );
        // console.log(currentTime, "currentTime");
        // console.log(
        //   this.film.imagesSpriteContainer.children.length,
        //   "this.film.imagesSpriteContainer.children.length"
        // );
        // lastRenderedImageIndex = currentImageIndex;
        //
        // console.log("currentImageIndex");
        // console.log(currentImageIndex);
        //
        // this.film.imagesSpriteContainer.children.forEach(
        //   (child, index) => (child.renderable = index === currentImageIndex)
        // );
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
