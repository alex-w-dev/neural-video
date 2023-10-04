export function getJsonFromGptAnswer(answer: string): object | null {
  const jsonString = answer.match(/(```(json)?)(.*)(```)/)?.[3].trim();

  if (!jsonString) {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}
