import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
const short = require("short-uuid");
import { Stage } from "@pixi/react";
import { Application } from "pixi.js";
import { v4 as uuidv4 } from "uuid";
import { shuffle } from "@/src/utils/utils";
// @ts-ignore
import FPSStats from "react-fps-stats";
import { uploadImagesToServer } from "@/src/utils/upload-images-to-server";
import { dataURItoFile } from "@/src/utils/data-u-r-ito-file";
import { Film } from "@/src/film/film.class";
import { VideRecorderOnReadyData } from "@/src/interfaces/common";
import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { getHtmlImg } from "@/src/utils/get-html-img";
import { FilmAnimation } from "@/src/film/animations/film-animation";
import { getFileSrcByPath } from "@/src/utils/get-file-src-by-path";

export type VideRecorderImage = {
  image: KandinskyImage;
  id: number;
  title: string;
};

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

console.log(short.generate(), "short.generate()");
console.log(uuidv4(), "uuidv4()");

export type VideRecorderProps = {
  images: VideRecorderImage[];
  audioFilePath: string;
  onVideReady: (data: VideRecorderOnReadyData) => void;
  filmAnimationClass: typeof FilmAnimation;
};

export function VideoRecorder({
  images,
  audioFilePath,
  onVideReady,
  filmAnimationClass,
}: VideRecorderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPath, setVideoPath] = useState("");
  const [serverRequest, setServerRequest] = useState(false);
  const [film, setFilm] = useState<Film | null>(null);
  const [filmImages, setFilmImages] = useState<
    { path: string; loop: number }[]
  >([]);
  const onExportImagesClick = useCallback(() => {
    if (!film?.recordedCanvases.length || isPlaying) {
      return alert("Film is not played yet");
    }

    setServerRequest(true);
    console.log("START READING DATA URL ....");
    film?.exportImages().then((imgs) => {
      console.log("START UPLOADING ....");
      uploadImagesToServer(
        imgs.map((img) => dataURItoFile(img.dataUrl, `${short.generate()}.png`))
      ).then((imgPaths) => {
        console.log("COMPLETE LOADING:");
        console.log("imgPaths", imgPaths);
        setFilmImages(
          imgs.map((img, index) => ({
            loop: img.duration / 1000,
            path: imgPaths[index],
          }))
        );

        setServerRequest(false);
      });
    });
  }, [isPlaying, film]);

  const onPlayClick = useCallback(() => {
    if (isPlaying || !images.length) {
      return;
    }

    setIsPlaying(true);

    film?.setImages(
      images.map((i) => {
        const img = getHtmlImg(i.image.src);
        return {
          image: img,
          title: i.title,
        };
      })
    );
    var audio = new Audio(getFileSrcByPath(audioFilePath));

    // just wait for pixi initialize images and render
    setTimeout(() => {
      try {
        film?.play({
          filmAnimationClass,
          onStart: () => {
            audio.play();
          },
          onStop: () => {
            setIsPlaying(false);
            audio.pause();
            console.log("`STOP VIDEO`", "STOP VIDEO");
          },
        });
      } catch (e) {
        console.error(e);
        setIsPlaying(false);
      }
    }, 500);
  }, [filmAnimationClass, film, isPlaying, images, audioFilePath]);

  const onMount = useCallback((app: Application) => {
    setFilm(new Film(app));
  }, []);

  const onSendVideoClick = useCallback(() => {
    setServerRequest(true);

    fetch("/api/generate-video", {
      method: "POST",
      body: JSON.stringify({
        images: filmImages,
        audio: audioFilePath,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((d) => d.json())
      .then((d) => {
        onVideReady({
          videoFilePath: d.data,
          videoSrc: getFileSrcByPath(d.data),
        });
        setVideoPath(getFileSrcByPath(d.data));
      })
      .finally(() => {
        setServerRequest(false);
      });
  }, [onVideReady, audioFilePath, filmImages]);

  return (
    <div>
      <div>
        <FPSStats left={"auto"} right={"0"} />
        <button onClick={onPlayClick} disabled={serverRequest}>
          Step 1: Generate Video Images
        </button>{" "}
        ------
        {film?.recordedCanvases.length ? (
          <button onClick={onExportImagesClick} disabled={serverRequest}>
            Step 2: export images
          </button>
        ) : null}
        ------
        {filmImages.length ? (
          <button onClick={onSendVideoClick}>
            Step 3: Send Video inServer
          </button>
        ) : null}
      </div>
      {/*<div>{videoPath ? <video controls src={videoPath} /> : null}</div>*/}
      <div>
        <Stage
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          style={{ zoom: "0.4" }}
          onMount={onMount}
        />
      </div>
    </div>
  );
}
