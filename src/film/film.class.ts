import {
  Application,
  BaseTexture,
  ImageSource,
  Texture,
  Sprite,
  Container,
} from "pixi.js";

import { cloneCanvas } from "@/src/utils/clone-canvas";
import { FilmAnimation } from "@/src/film/animations/film-animation";
import { MOBILE_VIDEO_HEIGHT, MOBILE_VIDEO_WIDTH } from "@/src/constants/sizes";

type FilmImage = { image: ImageSource; title: string };

export class Film {
  isPlaying = false;
  images: FilmImage[] = [];

  // dataURItoFile()
  canvasImages: string[] = [];
  recordedCanvases: { canvas: HTMLCanvasElement; duration: number }[] = [];

  imagesSpriteContainer: Container = new Container();

  constructor(public app: Application) {
    this.imagesSpriteContainer.width = 1080;
    this.imagesSpriteContainer.height = 1920;

    this.app.stage.addChild(this.imagesSpriteContainer);
  }

  setImages(images: FilmImage[]): void {
    this.images = images;

    this.imagesSpriteContainer.addChild(
      ...this.images.map((img, index) => {
        const sprite = this.getSpriteFromImg(img.image);
        sprite.renderable = false;

        return sprite;
      })
    );
  }

  getSpriteFromImg(image: ImageSource): Sprite {
    const texture = new Texture(new BaseTexture(image));
    const sprite = new Sprite(texture);

    sprite.width = MOBILE_VIDEO_WIDTH;
    sprite.height = MOBILE_VIDEO_HEIGHT;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.x = MOBILE_VIDEO_WIDTH / 2;
    sprite.y = MOBILE_VIDEO_HEIGHT / 2;

    return sprite;
  }

  async play({
    onStart,
    onStop,
    filmAnimationClass,
  }: {
    onStart: () => void;
    onStop: () => void;
    filmAnimationClass: typeof FilmAnimation;
  }) {
    const animation = new filmAnimationClass(this);

    if (this.images.length < animation.needImagesLength()) {
      const msg = `Слишком мало картинок! надо ${animation.needImagesLength()}`;
      alert(msg);
      throw new Error(msg);
    }

    this.canvasImages = [];
    this.recordedCanvases = [];
    this.isPlaying = true;

    await animation.beforePlay();

    onStart();
    animation.play();
    this.startRecording();

    console.log("animation.getTime()", animation.getTime());

    setTimeout(() => {
      onStop();
      this.stop();
      animation.stop();
    }, animation.getTime());
  }

  startRecording() {
    this.recordedCanvases = [];
    const canvas = this.app.renderer.view as HTMLCanvasElement;
    let lastRead = Date.now();

    const a = () => {
      const now = Date.now();

      if (now - lastRead < 40) {
        return requestAnimationFrame(a);
      }

      if (!this.isPlaying) {
        if (this.recordedCanvases[this.recordedCanvases.length - 1]) {
          this.recordedCanvases[this.recordedCanvases.length - 1].duration =
            now - lastRead;
        }

        return;
      }

      // set duration to previous
      if (this.recordedCanvases[this.recordedCanvases.length - 1]) {
        this.recordedCanvases[this.recordedCanvases.length - 1].duration =
          now - lastRead;
      }
      // set new
      this.recordedCanvases.push({
        duration: 0,
        canvas: cloneCanvas(canvas),
      });
      // reset timer
      lastRead = now;

      requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  }

  stop() {
    this.isPlaying = false;
  }

  exportImages(): Promise<{ dataUrl: string; duration: number }[]> {
    return new Promise((res) => {
      requestAnimationFrame(() => {
        const exportData: { dataUrl: string; duration: number }[] = [];

        const summ1 = this.recordedCanvases.reduce(
          (zcc, x) => zcc + x.duration,
          0
        );
        console.log(summ1, "summ");
        this.recordedCanvases.forEach((c) => {
          const dataUrl = c.canvas.toDataURL("image/png");

          const prev = exportData[exportData.length - 1];

          if (prev && prev.dataUrl === dataUrl) {
            prev.duration += c.duration;
            console.log("increased duration");
          } else {
            exportData.push({
              dataUrl: c.canvas.toDataURL("image/png"),
              duration: c.duration,
            });
            console.log("added image data");
          }
        });

        const summ = exportData.reduce((zcc, x) => zcc + x.duration, 0);
        console.log(summ, "summ");

        res(exportData);
      });
    });
  }
}
