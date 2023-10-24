import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Sprite, Text, TextStyle } from "pixi.js";
import { tween } from "@/src/utils/tween";
// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";
import { currentVideoStore } from "@/src/stores/current-video.store";
import { Fragment } from "@/src/stores/fragment.interface";
import { getHtmlImgPromise } from "@/src/utils/get-html-img";

export class ScientistAnswerAnimation extends FilmAnimation {
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

  switchOnFragment(fragment: Fragment): void {
    const previousFragment = currentVideoStore.getPreviousFragment(fragment);
    const previousFrameLast1 = this.imgSrcToSprite.get(
      previousFragment.transitPostImages![
        previousFragment.transitPostImages!.length - 2
      ].src
    );
    const previousFrameLast2 = this.imgSrcToSprite.get(
      previousFragment.transitPostImages![
        previousFragment.transitPostImages!.length - 1
      ].src
    );
    const myTransit3 = this.imgSrcToSprite.get(
      fragment.transitPreImages![2].src
    );
    const myTransit4 = this.imgSrcToSprite.get(
      fragment.transitPreImages![3].src
    );
    const otherSprites = fragment
      .transitPreImages!.slice(4)
      .map((img) => this.imgSrcToSprite.get(img.src));
    let currenSprite: Sprite | undefined;
    let step = 0;
    const nextStep = () => {
      switch (step) {
        case 0:
          console.log(0, "0");
          previousFrameLast1!.renderable = true;
          previousFrameLast1!.alpha = 0.4;
          myTransit3!.renderable = true;
          myTransit3!.alpha = 0.6;
          break;
        case 1:
          console.log(1, "1");
          previousFrameLast1!.renderable = false;
          myTransit3!.renderable = false;
          previousFrameLast2!.renderable = true;
          previousFrameLast2!.alpha = 0.2;
          myTransit4!.renderable = true;
          myTransit4!.alpha = 0.8;
          break;
        case 2:
          console.log(2, "2");
          previousFrameLast2!.renderable = false;
          myTransit4!.renderable = false;
        default:
          console.log(`defulat`, "`defulat`");
          if (currenSprite) {
            currenSprite.renderable = false;
          }
          currenSprite = otherSprites.shift();
          if (currenSprite) {
            currenSprite.renderable = true;
          }
      }

      step++;
    };

    const interval = setInterval(() => {
      if (!otherSprites.length) {
        clearInterval(interval);
        console.log(22222, "22222");
        if (currenSprite) {
          currenSprite.renderable = false;
        }

        this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
      } else {
        nextStep();
      }
    }, 100);
    nextStep();
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

      // this.film.imagesSpriteContainer.children.forEach(
      //   (child, index) => (child.renderable = index === currentImageIndex)
      // );

      const needToChangeState = currentImageIndex !== lastRenderedImageIndex;

      if (needToChangeState) {
        lastRenderedImageIndex = currentImageIndex;
        const fragment = currentVideoStore.fragments[currentImageIndex];
        if (fragment) {
          this.switchOnFragment(fragment);
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
