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
import { GAME_STOP_ANIMATION_MP3 } from "@/src/constants/paths";
import { StopGameAnimation } from "@/src/film/animations/stop-game.animation";
import styled from "styled-components";

type Image = {
  src: string;
  id: number;
  title: string;
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
  const onExportImagesClick = useCallback(() => {
    if (!film?.recordedCanvases.length || isPlaying) {
      return alert("Film is not played yet");
    }
    console.log("START READING DATA URL ....");
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
        setImages(
          imgs.map((i) => ({ src: i.dataUrl, id: Math.random(), title: "" })) ||
            []
        );
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
        const img = document.createElement("img");
        img.src = i.src;
        return {
          image: img,
          title: i.title,
        };
      })
    );
    var audio = new Audio(
      `http://localhost:3000/api/get-file?path=${GAME_STOP_ANIMATION_MP3}`
    );

    // just wait for pixi initialize images and render
    setTimeout(() => {
      try {
        audio.play();

        film?.play({
          filmAnimationClass: StopGameAnimation,
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
  }, [film, isPlaying, images]);

  const onInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const imgs = Array.from(e.target.files!).map((image) => ({
      src: window.URL.createObjectURL(image),
      id: Math.random(),
      title: "",
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
        audio: GAME_STOP_ANIMATION_MP3,
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

  const onImageTitleChange = useCallback(
    (image: Image, newTitle: string) => {
      const existingImage = images.find((i) => i.id === image.id);
      existingImage!.title = newTitle;

      setImages([...images]);
    },
    [images]
  );

  return (
    <div>
      <div>
        <FPSStats left={"auto"} right={"0"} />
        <button onClick={onPlayClick}>
          Step 1: Generate Video Images
        </button>{" "}
        ------
        {film?.recordedCanvases.length ? (
          <button onClick={onExportImagesClick}>Step 2: export images</button>
        ) : null}
        ------
        {filmImages.length ? (
          <button onClick={onSendVideoClick}>
            Step 3: Send Video inServer
          </button>
        ) : null}
      </div>
      <div>{videoPath ? <video controls src={videoPath} /> : null}</div>
      <div>
        <div>Add Images</div>
        <input type="file" name="" id="" onChange={onInput} multiple />
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
        <button onClick={() => setImages([...shuffle(images)])}>SHUFFLE</button>
      </div>
      <div>
        {images.map((image) => (
          <Jdasd key={image.id}>
            <img width={100} src={image.src} alt="" />
            <textarea
              value={image.title}
              onChange={(e) => onImageTitleChange(image, e.target.value)}
            />
            <button
              onClick={() =>
                setImages([...images.filter((i) => i !== image), image])
              }
            >
              To last
            </button>
          </Jdasd>
        ))}
      </div>
    </div>
  );
}

const Jdasd = styled.div`
  display: inline-flex;
  flex-direction: column;
`;
