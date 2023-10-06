export function getJsonFromGptAnswer(answer: string): object | null {
  if (typeof answer !== "string") return null;

  try {
    return JSON.parse(answer);
  } catch (e) {
    // we just try: move on!
  }

  const jsonString = answer
    .replace(/\n/gm, "")
    .match(/(```(json)?)(.*)(```)/)?.[3]
    .trim();

  if (!jsonString) {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}
