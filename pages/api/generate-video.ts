import type { NextApiRequest, NextApiResponse } from "next";
import { saveImagesAsVideo } from "@/src/utils/save-images-as-video";

type ResponseData = {
  data: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const images: { path: string; loop: number }[] = req.body.images;

  console.log("images", images);

  const filePath = await saveImagesAsVideo(images);

  res.json({ data: filePath });
}
