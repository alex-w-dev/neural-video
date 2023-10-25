import type { NextApiRequest, NextApiResponse } from "next";
import {
  getYoutubeForUser,
  youtubeVideCategoryIds,
} from "@/server/utils/youtube";
import { GaxiosResponse } from "gaxios";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import * as fs from "fs";
import path from "path";
import { UploadVideoParams } from "@/src/interfaces/upload-video-params";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.title) {
    throw new Error("body.title is required");
  }
  if (!req.body.description) {
    throw new Error("body.description is required");
  }
  if (!req.body.tags) {
    throw new Error("body.tags is required");
  }
  if (!req.body.videoFilePath) {
    throw new Error("body.videoFilePath is required");
  }

  const { title, description, tags, videoFilePath } =
    req.body as UploadVideoParams;
  const youtube = getYoutubeForUser(req, res);

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: youtubeVideCategoryIds.Entertainment,
        defaultLanguage: "ru",
        defaultAudioLanguage: "ru",
      },
      status: {
        publishAt: new Date(new Date().setHours(18)).toISOString(),
        privacyStatus: "private",
      },
    },
    media: {
      body: fs.createReadStream(path.join(videoFilePath)),
    },
  });

  res.send(response);
}
