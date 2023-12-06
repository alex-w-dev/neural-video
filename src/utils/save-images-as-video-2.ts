const getMP3Duration = require("get-mp3-duration");
const ffmpeg = require("fluent-ffmpeg");
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import path from "path";

import { VIDEO_FOLDER_ABSOLUTE_PATH, IMG_FOLDER } from "@/src/constants/paths";

var fps = 60;
var finalVideoPath = "/whatever_path_works_for_you";

// setup videoshow options
var videoOptions = {
  fps: fps,
  transition: false,
  videoBitrate: 1024 * 16,
  videoCodec: "libx264",
  audioBitrate: "256k",
  size: "1080x1920",
  outputOptions: ["-pix_fmt yuv420p"],
  format: "mp4",
};

export async function saveImagesAsVideo2(
  images: { path: string; loop: number }[],
  audio: string
): Promise<string> {
  const imageExtension = "png";
  const padSize = 6;

  let regex = new RegExp(`^img(.*)${imageExtension}$`);
  console.log(`Remove old images`, "...");
  const allFiles = await fs.promises.readdir(IMG_FOLDER);

  for (const needTorRemoveFile of allFiles.filter((f) => regex.test(f))) {
    await fs.promises.unlink(path.join(IMG_FOLDER, needTorRemoveFile));
  }

  console.log(`Copy images`, "`Copy images`");
  for (const image of images) {
    await fs.promises.copyFile(
      image.path,
      path.join(
        IMG_FOLDER,
        `img${`${images.indexOf(image)}`.padStart(
          padSize,
          "0"
        )}.${imageExtension}`
      )
    );
  }
  console.log(`Copying done`);

  const buffer = await fs.promises.readFile(audio);
  const duration = getMP3Duration(buffer);
  console.log(duration, "duration");
  console.log(
    1000 / (duration / images.length),
    "1000 / (duration / images.length)"
  );
  const fps = 1000 / (duration / images.length);

  return new Promise((resolve, reject) => {
    const videoName = `${uuidv4()}.mp4`;

    console.log(
      path.join(IMG_FOLDER, `img%0${padSize}d.${imageExtension}`),
      "path.join(IMG_FOLDER, `img%0${padSize}d.${imageExtension}`)"
    );

    let newMp4 = ffmpeg()
      .format("mp4")
      .videoBitrate("1024k")
      .videoCodec("libx264")
      .size("1080x1920")
      .audioBitrate("256k")
      .outputOptions(["-pix_fmt yuv420p"])
      .input(path.join(IMG_FOLDER, `img%0${padSize}d.${imageExtension}`))
      .inputFPS(fps)
      .addInput(audio)
      .save(`${VIDEO_FOLDER_ABSOLUTE_PATH}/${videoName}`)
      .fps(25) // Control FPS
      .duration(duration / 1000)
      .frames(images.length) // Control frame number
      .on("end", () => {
        console.log("done");
        resolve(`${VIDEO_FOLDER_ABSOLUTE_PATH}/${videoName}`);
      })
      .on("error", (err: Error) => {
        reject(err);
      });
  });
}
