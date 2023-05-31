import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Stage } from "@pixi/react";
import {
  TextStyle,
  Application,
  ImageSource,
  Sprite,
  BaseTexture,
  TilingSprite,
} from "pixi.js";
import { v4 as uuidv4 } from "uuid";
import { shuffle } from "@/src/utils/utils";
import { canvasToFile } from "@/src/utils/canvas-to-blob";
// @ts-ignore
import FPSStats from "react-fps-stats";
import { Texture } from "@pixi/core";
import { randomUUID } from "crypto";
import { uploadImagesToServer } from "@/src/utils/upload-images-to-server";
import { dataURItoFile } from "@/src/utils/data-u-r-ito-file";

type Image = {
  src: string;
  id: number;
};

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const IMAGES_COUNT = 25;
const MAX_FRAME_COUNT = 90;
const FPS = 60;
const framesToImageIndex: [number, number][] = [
  [21, 0],
  [24, IMAGES_COUNT - 5],
  [27, IMAGES_COUNT - 4],
  [32, IMAGES_COUNT - 3],
  [39, IMAGES_COUNT - 2],
  [MAX_FRAME_COUNT, IMAGES_COUNT - 1],
];
const CANVAS_ID = "ddddddddddddd";

function frameToImgIndex(frame: number): number {
  for (const [frameMax, imageIndex] of framesToImageIndex) {
    if (frame < frameMax) {
      return imageIndex || frame;
    }
  }

  return IMAGES_COUNT - 1;
}

export default function Drew() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPath, setVideoPath] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const [film, setFilm] = useState<Film | null>(null);
  const [filmImages, setFilmImages] = useState<
    { path: string; loop: number }[]
  >([]);

  const onPlayClick = useCallback(() => {
    if (isPlaying) {
      return;
    }

    if (images.length < IMAGES_COUNT) {
      alert(`Нужно больше картинок: ${images.length}/${IMAGES_COUNT}`);
      return;
    }

    setIsPlaying(true);
    film?.play();
    setTimeout(() => {
      film?.stop();
      setIsPlaying(false);
      console.log("`STOP VIDEO`", "STOP VIDEO");
      console.log("START READING DATA URL ....");
      // TODO remove
      film?.exportImages().then((imgs) => {
        console.log("START UPLOADING ....");
        uploadImagesToServer(
          imgs.map((img) => dataURItoFile(img.dataUrl, `${uuidv4()}.png`))
        ).then((imgPaths) => {
          console.log("COMPLETE LOADING:");
          console.log("imgPaths", imgPaths);
          setFilmImages(
            imgs.map((img, index) => ({
              loop: img.duration / 1000,
              path: imgPaths[index],
            }))
          );
        });

        setImages(
          imgs.map((i) => ({ src: i.dataUrl, id: Math.random() })) || []
        );
      });
    }, 3000);
  }, [film, isPlaying, images]);

  const onInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const imgs = Array.from(e.target.files!).map((image) => ({
        src: window.URL.createObjectURL(image),
        id: Math.random(),
      }));
      setImages(imgs);
      film?.setImages(
        imgs.map((i) => {
          const img = document.createElement("img");
          img.src = i.src;
          return img;
        })
      );
    },
    [film]
  );
  const onMount = useCallback((app: Application) => {
    setFilm(new Film(app));
  }, []);

  const onSendVideoClick = useCallback(() => {
    fetch("/api/generate-video", {
      method: "POST",
      body: JSON.stringify({
        images: filmImages,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((d) => d.json())
      .then((d) =>
        setVideoPath("http://localhost:3000/api/get-file?path=" + d.data)
      );
  }, [filmImages]);

  return (
    <div>
      <div>
        <FPSStats left={"auto"} right={"0"} />
        <button onClick={onPlayClick}>Generate Video Images</button>{" "}
        --------------------------------------------------
        {filmImages.length ? (
          <button onClick={onSendVideoClick}>Send Video inServer</button>
        ) : null}
      </div>
      <div>{videoPath ? <video controls src={videoPath} /> : null}</div>
      <div>
        <div>Add Images</div>
        <input type="file" name="" id="" onChange={onInput} multiple />
      </div>
      <div>
        <button onClick={() => setImages([...shuffle(images)])}>SHUFFLE</button>
      </div>
      <div>
        <Stage
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          style={{ zoom: "0.4" }}
          id={CANVAS_ID}
          onMount={onMount}
        />
      </div>
      <div>
        {images.map((image) => (
          <span key={image.id}>
            <img width={100} src={image.src} alt="" />
            <button
              onClick={() =>
                setImages([...images.filter((i) => i !== image), image])
              }
            >
              To last
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

class Film {
  isPlaying = false;
  images: ImageSource[] = [];

  // dataURItoFile()
  canvasImages: string[] = [];
  canvasEs: { canvas: HTMLCanvasElement; duration: number }[] = [];

  constructor(public app: Application) {}

  setImages(images: ImageSource[]): void {
    this.images = images;

    this.app.stage.addChild(
      ...this.images.map((img, index) => {
        const texture = new Texture(new BaseTexture(img));

        texture.width;
        console.log("texture.baseTexture.width", texture.width);
        // const sprite = new TilingSprite(texture, VIDEO_WIDTH, VIDEO_HEIGHT);

        const sprite = new Sprite(texture);
        sprite.scale;

        sprite.width = VIDEO_WIDTH;
        sprite.height = VIDEO_HEIGHT;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = VIDEO_WIDTH / 2;
        sprite.y = VIDEO_HEIGHT / 2;

        sprite.renderable = index === 0;

        return sprite;
      })
    );
  }

  play() {
    let frame = 0;
    const start = Date.now();
    let last = Date.now();
    let f = 0;

    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;

    // dataURItoFile()
    this.canvasImages = [];
    this.isPlaying = true;
    const intervalTime = 1000 / FPS;
    let lastRead = Date.now();
    let lastRenderedImageIndex = 0;

    let y = 0;
    const a = () => {
      const now = Date.now();
      if (!this.isPlaying) {
        console.log("y", y);
        console.log("frame", frame);
        console.log("f", f);

        if (this.canvasEs[this.canvasEs.length - 1]) {
          this.canvasEs[this.canvasEs.length - 1].duration = now - lastRead;
        }

        return;
      }

      if (last + 33.3 < now) {
        console.log(now - last);
        last = now;
        f += 1;
        frame += 1;
      }

      const currentImageIndex = frameToImgIndex(frame);
      if (currentImageIndex !== lastRenderedImageIndex) {
        this.app.stage.children.forEach(
          (child, index) => (child.renderable = index === currentImageIndex)
        );
        lastRenderedImageIndex = currentImageIndex;
      }

      if (true) {
        y++;

        // set duration to previous
        if (this.canvasEs[this.canvasEs.length - 1]) {
          this.canvasEs[this.canvasEs.length - 1].duration = now - lastRead;
        }
        // set new
        this.canvasEs.push({
          duration: 0,
          canvas: cloneCanvas(canvas),
        });
        // reset timer
        lastRead = now;
      }
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

        this.canvasEs.forEach((c) => {
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

function cloneCanvas(oldCanvas: HTMLCanvasElement): HTMLCanvasElement {
  //create a new canvas
  var newCanvas = document.createElement("canvas");
  var context = newCanvas.getContext("2d");

  //set dimensions
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  //apply the old canvas to the new one
  context!.drawImage(oldCanvas, 0, 0);

  //return the new canvas
  return newCanvas;
}
