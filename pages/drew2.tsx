import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Stage } from "@pixi/react";
import { Application } from "pixi.js";
import { v4 as uuidv4 } from "uuid";
import { shuffle } from "@/src/utils/utils";
// @ts-ignore
import FPSStats from "react-fps-stats";
import { uploadImagesToServer } from "@/src/utils/upload-images-to-server";
import { dataURItoFile } from "@/src/utils/data-u-r-ito-file";
import { Film } from "@/src/film/film.class";
import { TrrrrAnimation } from "@/src/film/animations/trrrr.animation";

type Image = {
  src: string;
  id: number;
};

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

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

    setIsPlaying(true);

    film?.setImages(
      images.map((i) => {
        const img = document.createElement("img");
        img.src = i.src;
        return img;
      })
    );

    // just wait for pixi initialize images and render
    setTimeout(() => {
      try {
        film?.play({
          filmAnimationClass: TrrrrAnimation,
          onStop: () => {
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
          },
        });
      } catch (e) {
        console.error(e);
        setIsPlaying(false);
      }
    }, 500);
  }, [film, isPlaying, images]);

  const onInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const imgs = Array.from(e.target.files!).map((image) => ({
      src: window.URL.createObjectURL(image),
      id: Math.random(),
    }));
    setImages(imgs);
  }, []);

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
