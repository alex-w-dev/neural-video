import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";
import { getImageSrcByName } from "@/src/utils/get-image-src-by-name";

export async function getKandinskyImageFromReturns(
  returns: KandinskyTxt2ImgReturns
): Promise<KandinskyImage> {
  const src = getImageSrcByName(returns.file_name);

  return {
    src,
    fileName: returns.file_name,
    filePath: returns.file_path,
  };
}
