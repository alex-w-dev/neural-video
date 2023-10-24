import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";
import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";
import { getKandinskyImageFromReturns } from "@/src/utils/get-kandinsky-image-from-returns";

export async function getKandinskyMobileMixedImages(
  imageFileName1: string,
  imageFileName2: string,
  count: number = 4
): Promise<KandinskyImage[]> {
  const result: KandinskyImage[] = [];

  const stepSize = Math.round(100 / (count + 1)) / 100;

  for (let i = 1; i <= count; i++) {
    const weight2 = i * stepSize;
    const weight1 = 1 - weight2;
    console.log(`getting weight2 ${weight2} ...`);
    const r = await fetch(
      `http://localhost:5000/mixImages?w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}&image_file_name1=${imageFileName1}&image_file_name2=${imageFileName2}&weight1=${weight1}&weight2=${weight2}`
    );
    const data: KandinskyTxt2ImgReturns[] = await r.json();

    const image = await getKandinskyImageFromReturns(data[0]);

    result.push(image);
  }

  return result;
}
