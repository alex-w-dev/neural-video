import { VIDEO_FOLDER_ABSOLUTE_PATH } from "@/src/constants/paths";

var videoshow = require("videoshow");
import { v4 as uuidv4 } from "uuid";
import path from "path";

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

export function saveImagesAsVideo(
  images: { path: string; loop: number }[],
  audio: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const videoName = `${uuidv4()}.mp4`;

    videoshow(images, videoOptions)
      .audio(audio)
      .save(`${VIDEO_FOLDER_ABSOLUTE_PATH}/${videoName}`)
      .on("start", function (command) {
        console.log("encoding " + finalVideoPath + " with command " + command);
      })
      .on("error", function (err) {
        reject(err);
      })
      .on("end", function (output) {
        console.log("output", output);
        resolve(`${VIDEO_FOLDER_ABSOLUTE_PATH}/${videoName}`);
        // do stuff here when done
      });
  });
}
