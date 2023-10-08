import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_VIDEO_HEIGHT, MOBILE_VIDEO_WIDTH } from "@/src/constants/sizes";

export async function getKandinskyMobileImage(prompt: string): Promise<string> {
  const translated = await getEnText(prompt);
  const result = await fetch(
    `http://localhost:5000/text2img?prompt=${encodeURI(
      translated
    )}&w=${MOBILE_VIDEO_WIDTH}&h=${MOBILE_VIDEO_HEIGHT}`
  );
  const data = await result.json();

  return `http://localhost:5000/img/${data[0].file_name}`;
}
