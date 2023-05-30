import type { NextApiRequest, NextApiResponse } from "next";
import { saveImagesAsVideo } from "@/src/utils/save-images-as-video";

type ResponseData = {
  videoFullPath: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const filePath = await saveImagesAsVideo();

  res.json({ videoFullPath: filePath });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
