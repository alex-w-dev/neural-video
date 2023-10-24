import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";
import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";
import { getKandinskyImageFromReturns } from "@/src/utils/get-kandinsky-image-from-returns";

export async function getKandinskyMobileImage(
  prompt: string
): Promise<KandinskyImage> {
  const translated = await getEnText(prompt);
  const result = await fetch(
    `http://localhost:5000/text2img?prompt=${encodeURI(
      translated
    )}&w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}`
  );
  const data: KandinskyTxt2ImgReturns[] = await result.json();

  return getKandinskyImageFromReturns(data[0]);
}
