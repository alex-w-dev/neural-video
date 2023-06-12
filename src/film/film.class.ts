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

export class Film {
  isPlaying = false;
  images: ImageSource[] = [];

  // dataURItoFile()
  canvasImages: string[] = [];
  recordedCanvases: { canvas: HTMLCanvasElement; duration: number }[] = [];

  imagesSpriteContainer: Container = new Container();

  constructor(public app: Application) {
    this.imagesSpriteContainer.width = 1080;
    this.imagesSpriteContainer.height = 1920;

    this.app.stage.addChild(this.imagesSpriteContainer);
  }

  setImages(images: ImageSource[]): void {
    this.images = images;

    this.imagesSpriteContainer.addChild(
      ...this.images.map((img, index) => {
        const texture = new Texture(new BaseTexture(img));

        texture.width;
        console.log("texture.baseTexture.width", texture.width);
        // const sprite = new TilingSprite(texture, VIDEO_WIDTH, VIDEO_HEIGHT);

        const sprite = new Sprite(texture);

        sprite.width = 1080;
        sprite.height = 1920;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = 1080 / 2;
        sprite.y = 1920 / 2;

        sprite.renderable = index === 0;

        return sprite;
      })
    );
  }

  play({
    onStop,
    filmAnimationClass,
  }: {
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

    animation.play();
    this.startRecording();

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

        res(exportData);
      });
    });
  }
}
