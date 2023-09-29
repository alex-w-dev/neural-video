import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthClient, YOUTUBE_AUTH_COOKIE_KEY } from "@/server/utils/youtube";
import { setCookie } from "cookies-next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  try {
    setCookie(
      YOUTUBE_AUTH_COOKIE_KEY,
      JSON.stringify(
        (await getAuthClient(req, res).refreshAccessToken()).credentials
      )
    );
    res.send("OK");
  } catch (e) {
    /// dsa
    console.error(e);
    res.status(401).send("Cannot update token");
  }
}
