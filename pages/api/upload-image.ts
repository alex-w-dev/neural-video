import { v4 as uuidv4 } from "uuid";
import path from "path";
import { IMG_FOLDER } from "@/src/constants/paths";
import { NextApiRequest, NextApiResponse } from "next";
import busboy from "busboy";
import * as fs from "fs";

const mime = require("mime-types");

const destination = IMG_FOLDER;
console.log("destination", destination);

function bbAsync(req: NextApiRequest): Promise<string> {
  return new Promise((res, rej) => {
    const bb = busboy({ headers: req.headers });
    bb.on("file", (name, file, info) => {
      const fileName =
        info.filename || uuidv4() + "." + mime.extension(info.mimeType);
      const saveTo = path.join(IMG_FOLDER, fileName);
      file.pipe(fs.createWriteStream(saveTo));

      file.on("close", () => {
        res(saveTo);
      });
    });
    bb.on("error", (e) => {
      console.error(e);

      rej(e);
    });
    req.pipe(bb);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uploaded = await bbAsync(req);

  console.log("222", 222);
  console.log("returns", uploaded);

  res.json({ data: uploaded });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
