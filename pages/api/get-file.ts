import { NextApiRequest, NextApiResponse } from "next";
import { createReadStream } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.path as string;
  const rs = createReadStream(path);

  rs.pipe(res);
}
