import type { NextApiRequest, NextApiResponse } from "next";
import {
  getYoutubeForUser,
  getYoutubeCommentThreads,
} from "@/server/utils/youtube";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const youtube = getYoutubeForUser(req, res);

  res.send(await getYoutubeCommentThreads(youtube));
}
