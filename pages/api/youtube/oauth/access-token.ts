import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthClient } from "@/server/utils/youtube";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  let token = "";
  try {
    token = (await getAuthClient(req, res).getAccessToken()).token || "";
  } catch (e) {
    /// dsa
    console.error(e);
  }

  if (token) {
    res.send(token);
  } else {
    res.status(404).send("Not Found Token");
  }
}
