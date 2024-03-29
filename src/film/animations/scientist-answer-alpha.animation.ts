import { FilmAnimation } from "./film-animation";
import { Film } from "@/src/film/film.class";
import { Sprite, Text, TextStyle } from "pixi.js";
// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";
import { currentVideoStore } from "@/src/stores/current-video.store";
import { Fragment } from "@/src/stores/fragment.interface";
import { getHtmlImgPromise } from "@/src/utils/get-html-img";
import { ChannelEnum } from "@/src/stores/channel.enum";

export class ScientistAnswerAlphaAnimation extends FilmAnimation {
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
    // this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
    // return;

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

          if (!otherSprites.length) {
            this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
            this.imgSrcToSprite.get(fragment.image!.src)!.alpha = 1;
          }

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

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!otherSprites.length && step > 2) {
          if (currenSprite) {
            currenSprite.renderable = false;
          }

          this.imgSrcToSprite.get(fragment.image!.src)!.renderable = true;
          this.imgSrcToSprite.get(fragment.image!.src)!.alpha = 1;
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
    const nextFragment = currentVideoStore.getNextFragment(fragment);
    const nextFrameTransit1 = this.imgSrcToSprite.get(
      nextFragment.transitPreImages![0].src
    );
    const nextFrameTransit2 = this.imgSrcToSprite.get(
      nextFragment.transitPreImages![1].src
    );
    const myFrameLast3 = this.imgSrcToSprite.get(
      fragment.transitPostImages![fragment.transitPostImages!.length - 4].src
    );
    const myFrameLast4 = this.imgSrcToSprite.get(
      fragment.transitPostImages![fragment.transitPostImages!.length - 3].src
    );
    const otherSprites = fragment
      .transitPostImages!.slice(0, -4)
      .map((img) => this.imgSrcToSprite.get(img.src));
    let currenSprite: Sprite | undefined;
    let lastRender = 0;
    const nextStep = () => {
      if (otherSprites.length) {
        if (currenSprite) {
          currenSprite.renderable = false;
        }
        currenSprite = otherSprites.shift();
        if (currenSprite) {
          currenSprite.renderable = true;
        }
      } else {
        lastRender++;
        if (lastRender === 1) {
          if (currenSprite) {
            currenSprite.renderable = false;
          }
          console.log(-2, "-2");
          nextFrameTransit1!.renderable = true;
          nextFrameTransit1!.alpha = 0.2;
          myFrameLast3!.renderable = true;
          myFrameLast3!.alpha = 0.8;
        } else {
          nextFrameTransit1!.renderable = false;
          myFrameLast3!.renderable = false;
          nextFrameTransit2!.renderable = true;
          nextFrameTransit2!.alpha = 0.4;
          myFrameLast4!.renderable = true;
          myFrameLast4!.alpha = 0.6;
        }
      }
    };

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (lastRender === 2) {
          nextFrameTransit2!.renderable = false;
          myFrameLast4!.renderable = false;

          clearInterval(interval);
          resolve();
        } else {
          nextStep();
        }
      }, 100);

      this.imgSrcToSprite.get(fragment.image!.src)!.renderable = false;
      nextStep();
    });
  }

  showIllustrationLabel() {
    const y = 0.7;
    const sprite = Sprite.from("/img/illustracii.png");
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.x = 1080 * 0.5;
    sprite.y = 1920 * (0.15 + y);
    sprite.scale.set(1);
    sprite.renderable = true;
    this.film.app.stage.addChild(sprite);
    const sprite2 = Sprite.from("/img/biblii.png");
    sprite2.anchor.x = 0.5;
    sprite2.anchor.y = 0.5;
    sprite2.x = 1080 * 0.5;
    sprite2.y = 1920 * (0.17 + y);
    sprite2.scale.set(1.5);
    sprite2.renderable = true;
    this.film.app.stage.addChild(sprite2);
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

  makeActiveFrameScalable() {
    const allImages = Array.from(this.imgSrcToSprite.values());
    let lastSprite: Sprite;
    let lastSpriteScaleX: number;
    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
        return;
      }

      const activeSprite = allImages.find((sprite) => sprite.renderable);

      if (activeSprite) {
        if (lastSprite !== activeSprite) {
          if (lastSprite) {
            lastSprite.scale.set(lastSpriteScaleX);
          }
          lastSprite = activeSprite;
          lastSpriteScaleX = activeSprite.scale.x;
        }

        activeSprite.scale.set(activeSprite.scale.x + 0.001);
      }
    }, 17);
  }

  play() {
    this.isPlaying = true;
    const start = Date.now();
    let lastRenderedImageIndex = -1;
    const timeOffset =
      ((currentVideoStore.fragments[0].transitPostImages?.length || 0) * 100) /
      2;

    this.imgSrcToSprite.get(
      currentVideoStore.fragments[0].image!.src
    )!.renderable = true;

    if (currentVideoStore.channel === ChannelEnum.neuralAcked) {
      this.playGptAddAnimation();
    }

    // if (currentVideoStore.channel === ChannelEnum.jesusIsPath) {
    //   this.showIllustrationLabel();
    // }

    this.makeActiveFrameScalable();

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
