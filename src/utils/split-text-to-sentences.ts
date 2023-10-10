export function splitTextToSentences(
  text: string,
  sentenceLength: number
): string[] {
  const fullSentencesCount = Math.floor(text.length / sentenceLength);
  const lastSentenceLength = text.length % sentenceLength;
  sentenceLength =
    sentenceLength + Math.ceil(lastSentenceLength / fullSentencesCount);

  const result: string[] = [];
  let tempSentence = "";

  for (let i = 0; i < text.length; i++) {
    if (
      tempSentence.length >= sentenceLength &&
      (text[i] === "," ||
        text[i] === "." ||
        (text[i] === "и" && text[i - 1] === " " && text[i + 1] === " "))
    ) {
      result.push(tempSentence.trim());
      tempSentence = "";

      continue;
    }

    tempSentence += text[i];
  }

  if (tempSentence) {
    result.push(tempSentence);
  }

  return result;
}
