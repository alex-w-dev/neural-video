export async function getEnText(sourceText: string): Promise<string> {
  var sourceLang = "ru";
  var targetLang = "en";

  var url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    encodeURI(sourceText.replaceAll("\n", ""));

  const result = await fetch(url);
  const data = await result.json();

  console.log(data);
  let translated = "";

  data[0].forEach((d: any) => {
    translated = translated + d[0].replace(/\(\)/g, "\n");
  });

  return translated;
}
