import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Container, Sprite, Stage, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { getCanvasRecorder } from "@/src/utils/canvas-recorder";
import { shuffle } from "@/src/utils/utils";

type Image = {
  src: string;
};

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const IMAGES_COUNT = 25;
const MAX_FRAME_COUNT = 90;
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
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [images, setImages] = useState<Image[]>([]);

  const currentImage = images[frameToImgIndex(frame)];

  const onPlayClick = useCallback(() => {
    if (isPlaying) {
      return;
    }

    if (images.length < IMAGES_COUNT) {
      alert(`Нужно большк картинок: ${images.length}/${IMAGES_COUNT}`);
      return;
    }

    setIsPlaying(true);
    const start = Date.now();
    let last = Date.now();
    let f = 0;

    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;

    const canvasRecorder = getCanvasRecorder({
      canvas,
      audioSrc: "/audio/money-counter.mp3",
    });

    canvasRecorder.startRecording();
    const a = async () => {
      if (f === MAX_FRAME_COUNT) {
        await canvasRecorder.stopRecording();
        const video = canvasRecorder.exportStream();
        console.log(video);
        canvas!.parentNode!.insertBefore(video, canvas);
        setIsPlaying(false);
        return;
      }
      const now = Date.now();
      if (last + 34 < now) {
        last = now;
        console.log(f);
        f += 1;
        setFrame(f);
      }
      requestAnimationFrame(a);
    };
    a();
  }, [isPlaying, frame, images]);

  const textStyle = useMemo(
    () =>
      new TextStyle({
        align: "center",
        dropShadow: true,
        dropShadowAlpha: 0.6,
        dropShadowAngle: 0,
        dropShadowBlur: 8,
        dropShadowColor: "#000",
        fill: "#ffffff",
        dropShadowDistance: 0,
        fontFamily: "Comic Sans MS",
        fontSize: 63,
        fontWeight: "bold",
        lineJoin: "round",
        miterLimit: 11,
        stroke: "#000",
        strokeThickness: 16,
        wordWrap: true,
      }),
    []
  );

  const onInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setImages(
      Array.from(e.target.files!).map((image) => ({
        src: window.URL.createObjectURL(image),
      }))
    );
  }, []);

  return (
    <div>
      <div>
        <button onClick={onPlayClick}>DSADASd</button>
      </div>
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
          style={{ zoom: "0.5" }}
          id={CANVAS_ID}
        >
          {currentImage ? (
            <Sprite
              image={currentImage.src}
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              x={VIDEO_WIDTH / 2}
              y={VIDEO_HEIGHT / 2}
              anchor={{ x: 0.5, y: 0.5 }}
            />
          ) : null}

          {/*<Container x={540} y={1360}>*/}
          {/*  <Text*/}
          {/*    text="Нейросеть нарисовала..."*/}
          {/*    style={textStyle}*/}
          {/*    anchor={{ x: 0.5, y: 0.5 }}*/}
          {/*  />*/}
          {/*</Container>*/}
        </Stage>
      </div>
      <div>
        {images.map((image) => (
          <span key={image.src}>
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
