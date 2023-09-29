import type { NextApiRequest, NextApiResponse } from "next";
import { getYoutubeForUser } from "@/server/utils/youtube";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.query.videoId) {
    throw new Error("voideoId is required");
  }

  const youtube = getYoutubeForUser(req, res);

  youtube.commentThreads.list(
    {
      part: ["snippet"],
      // auth: getAuthClient(req, res),
      videoId: req.query.videoId as string,
      textFormat: "plainText",
      order: "time",
      moderationStatus: "published",
    },
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
