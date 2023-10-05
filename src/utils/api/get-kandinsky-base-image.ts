import { getEnText } from "@/src/utils/get-en-text";

export async function getKandinskyBaseImage(prompt: string): Promise<string> {
  const translated = await getEnText(prompt);
  const result = await fetch(
    `http://localhost:5000/text2img?prompt=${encodeURI(translated)}`
  );
  const data = await result.json();

  return `http://localhost:5000/img/${data[0].file_name}`;
}
