import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";
import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { getImageSrcByName } from "@/src/utils/get-image-src-by-name";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";

export async function getKandinskyMobileImageTransformation(
  imageFileName: string,
  targetPrompt: string,
  steps: number = 5
): Promise<KandinskyImage[]> {
  const translated = await getEnText(targetPrompt);

  const result: KandinskyImage[] = [];
  let currentImageName = imageFileName;

  for (let i = 0; i < steps; i++) {
    const strength = [3, 4].includes(i) ? 0.15 : 0.1;
    console.log(`getting strength ${strength} ...`);
    const r = await fetch(
      `http://localhost:5000/img2img?prompt=${encodeURI(
        translated
      )}&w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}&image_name=${currentImageName}&prior_steps=50&strength=${strength}`
    );
    const data: KandinskyTxt2ImgReturns[] = await r.json();
    currentImageName = data[0].file_name;

    result.push({
      src: getImageSrcByName(data[0].file_name),
      fileName: data[0].file_name,
      filePath: data[0].file_path,
    });
  }

  return result;
}
