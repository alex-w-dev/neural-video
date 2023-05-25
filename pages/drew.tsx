import React, { useCallback, useMemo, useState } from "react";
import { Container, Sprite, Stage, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";

type Image = {
  src: string;
};

const IMAGES_COUNT = 25;
const MAX_FRAME_COUNT = 90;
const framesToImageIndex: [number, number][] = [
  [22, 0],
  [24, IMAGES_COUNT - 5],
  [27, IMAGES_COUNT - 4],
  [32, IMAGES_COUNT - 3],
  [39, IMAGES_COUNT - 2],
  [MAX_FRAME_COUNT, IMAGES_COUNT - 1],
];

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
  const [images, setImages] = useState<Image[]>([
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
    { src: "https://pixijs.io/pixi-react/img/bunny.png" },
    { src: "https://wave.video/blog/wp-content/uploads/2022/11/Bitter.png" },
  ]);

  const currentImage = images[frameToImgIndex(frame)];

  const onPlayClick = useCallback(() => {
    if (isPlaying) {
      return;
    }
    console.log(1);

    setIsPlaying(true);
    const start = Date.now();
    let last = Date.now();
    let f = 0;

    const a = () => {
      if (f === MAX_FRAME_COUNT) {
        setIsPlaying(false);
        return;
      }
      const now = Date.now();
      if (last + 34 < now) {
        last = now;
        console.log(f);
        f += 1;
        setFrame(f);
      } else {
        console.log("oops");
      }
      requestAnimationFrame(a);
    };
    a();
  }, [isPlaying, frame]);

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

  return (
    <div>
      <div>
        <button onClick={onPlayClick}>DSADASd</button>
      </div>
      <div>
        <Stage width={1080} height={1820} style={{ zoom: "0.5" }}>
          <Sprite
            image={currentImage.src}
            width={1080}
            height={1820}
            x={540}
            y={960}
            anchor={{ x: 0.5, y: 0.5 }}
          />

          <Container x={540} y={1360}>
            <Text
              text="Нейросеть нарисовала..."
              style={textStyle}
              anchor={{ x: 0.5, y: 0.5 }}
            />
          </Container>
        </Stage>
      </div>
    </div>
  );
}
