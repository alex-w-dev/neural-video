import type { NextApiRequest, NextApiResponse } from "next";
import { getYoutubeForUser } from "@/server/utils/youtube";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.body.videoId) {
    throw new Error("body.videoId is required");
  }
  if (!req.body.text) {
    throw new Error("body.text is required");
  }

  var youtube = getYoutubeForUser(req, res);

  youtube.commentThreads.insert(
    {
      part: ["snippet"],
      requestBody: {
        snippet: {
          videoId: req.body.videoId,
          topLevelComment: {
            snippet: {
              videoId: req.body.videoId,
              textOriginal: req.body.text,
            },
          },
        },
      },
    },
    // @ts-ignore
    function (err, data) {
      if (err) {
        console.error("Error: " + err);
        res.send(err);
      }
      if (data) {
        res.send(data);
        console.log(data);
      }
    },
  );
}
