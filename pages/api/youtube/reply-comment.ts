import type { NextApiRequest, NextApiResponse } from "next";
import { getYoutubeForUser } from "@/server/utils/youtube";

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
}
