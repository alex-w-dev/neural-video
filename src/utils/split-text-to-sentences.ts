import { Fragment } from "@/src/stores/fragment.interface";

export function splitTextToSentences(
  text: string,
  fragmentLength: number
): Fragment[] {
  const fullSentencesCount = Math.floor(text.length / fragmentLength);
  const lastSentenceLength = text.length % fragmentLength;
  fragmentLength =
    fragmentLength + Math.ceil(lastSentenceLength / fullSentencesCount);
  console.log(fragmentLength, "fragmentLength");

  const sentences: string[] = [];
  let tempSentence = "";

  // split to sentences
  for (let i = 0; i < text.length; i++) {
    if (
      tempSentence.length >= 6 /* fix numbers as sentence */ &&
      text[i] === "."
    ) {
      sentences.push(tempSentence.trim());
      tempSentence = "";

      continue;
    }

    tempSentence += text[i];
  }

  if (tempSentence) {
    sentences.push(tempSentence.trim());
  }

  const fragments: Fragment[] = [];

  // generate fragments
  for (const sentence of sentences) {
    let tempFragment = "";
    for (let i = 0; i < sentence.length; i++) {
      if (tempFragment.length >= fragmentLength && sentence[i] === " ") {
        fragments.push({
          sentence: sentence,
          fragment: tempFragment.trim(),
        });
        tempFragment = "";

        continue;
      }

      tempFragment += sentence[i];
    }

    if (tempFragment) {
      fragments.push({
        sentence,
        fragment: tempFragment.trim(),
      });
    }
  }

  return fragments;
}
