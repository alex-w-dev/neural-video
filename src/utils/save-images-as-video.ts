import { VIDEO_FOLDER } from "@/src/constants/paths";

var videoshow = require("videoshow");
import { v4 as uuidv4 } from "uuid";
import path from "path";

var fps = 60;
var secondsToShowEachImage = 1 / fps;
var finalVideoPath = "/whatever_path_works_for_you";

// setup videoshow options
var videoOptions = {
  fps: fps,
  transition: false,
  videoBitrate: 1024,
  videoCodec: "libx264",
  size: "1080x1920",
  outputOptions: ["-pix_fmt yuv420p"],
  format: "mp4",
};

// array of images to make the 'videoshow' from
var images = [
  {
    path: "C:\\youtube\\AI-answer\\videos\\29\\img\\20230527205645.png",
    loop: secondsToShowEachImage,
  },
  {
    path: "C:\\youtube\\AI-answer\\videos\\29\\img\\20230527205645.png",
    loop: secondsToShowEachImage,
  },
];

export function saveImagesAsVideo(): Promise<string> {
  return new Promise((resolve, reject) => {
    const videoName = `${uuidv4()}.mp4`;

    videoshow(images, videoOptions)
      .save(`./${VIDEO_FOLDER}/${videoName}`)
      .on("start", function (command) {
        console.log("encoding " + finalVideoPath + " with command " + command);
      })
      .on("error", function (err) {
        reject(new Error(err));
      })
      .on("end", function (output) {
        console.log("output", output);
        resolve(path.join(__dirname, "../../", videoName, videoName));
        // do stuff here when done
      });
  });
}
