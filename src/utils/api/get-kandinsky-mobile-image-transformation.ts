import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";

export async function getKandinskyMobileImageTransformation(
  imageFileName: string,
  targetPrompt: string
): Promise<KandinskyTxt2ImgReturns[]> {
  const translated = await getEnText(targetPrompt);

  const result = [];

  for (let i = 0; i < 14; i++) {
    const strength = i < 13 ? 0.5 : i < 9 ? 0.2 : 0.1;
    console.log(`getting strength ${strength} ...`);
    const r = await fetch(
      `http://localhost:5000/img2img?prompt=${encodeURI(
        translated
      )}&w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}&image_name=${imageFileName}&strength=${strength}`
    );
    const data = await r.json();

    result.push(data[0]);
  }

  return result;
}
