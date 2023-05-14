import { KandinskyTxt2ImgParams } from "@/src/dto/kandinsky-txt-2-img-params";
import { KandinskyTxt2ImgReturns } from "@/src/dto/kandinsky-txt-2-img-returns";

export async function getRuFromEn(sourceText: string) {
  var sourceLang = "ru";
  var targetLang = "en";

  var url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    encodeURI(sourceText);

  const result = await fetch(url);
  const data = await result.json();

  console.log(data);

  return data[0][0][0].replace(/\(\)/g, "\n");
}

export async function kandinskyTxt2ImgGenerate(
  params: KandinskyTxt2ImgParams
): Promise<KandinskyTxt2ImgReturns> {
  const asString = Object.entries(params)
    .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
    .join("&");

  const result = await fetch(`http://localhost:5000/text2img?${asString}`);
  const data = await result.json();

  return new KandinskyTxt2ImgReturns(data[0]);
}

export function isServer() {
  return typeof window === "undefined";
}
export function isClient() {
  return !isServer();
}
