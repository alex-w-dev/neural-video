import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";

export async function getKandinskyMobileImage(prompt: string): Promise<string> {
  const translated = await getEnText(prompt);
  const result = await fetch(
    `http://localhost:5000/text2img?prompt=${encodeURI(
      translated
    )}&w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}`
  );
  const data = await result.json();

  return `http://localhost:5000/img/${data[0].file_name}`;
}
