import type { NextApiRequest, NextApiResponse } from "next";
import { getYoutubeForUser } from "@/server/utils/youtube";
import { GaxiosResponse } from "gaxios";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.commentId) {
    throw new Error("body.commentId is required");
  }
  if (!req.body.text) {
    throw new Error("body.text is required");
  }

  var youtube = getYoutubeForUser(req, res);

  youtube.comments.insert(
    {
      part: ["snippet"],
      requestBody: {
        snippet: {
          textOriginal: req.body.text,
          parentId: req.body.commentId,
        },
      },
    },
    function (
      err: Error | null,
      data: GaxiosResponse<youtube_v3.Schema$Comment> | null | undefined
    ) {
      if (err) {
        console.error("Error: " + err);
        res.send(err);
      }
      if (data) {
        res.send(data);
        console.log(data);
      }
    }
  );
}
