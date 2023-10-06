import { getJsonFromGptAnswer } from "@/src/utils/get-json-from-gpt-answer";
import { Fragment } from "@/src/interfaces/common";

export async function getGptSeparatedText(
  prompt: string,
  tryCount = 0
): Promise<Array<string>> {
  if (tryCount++ > 5) {
    return [prompt];
  }

  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли копирайтера. Раздели следующий текст на примерно равные части, каждая часть - это законченная мысль. каждая часть должна быть не больше 70 символов и не меньше 40 символов: "${prompt}".
        Ответ должен быть в JSON формате: массив строк`,
      }),
    })
  );
  const data = await result.json();

  let array = getJsonFromGptAnswer(data.message);

  if (!array) {
    return getGptSeparatedText(prompt, tryCount);
  }

  if (!Array.isArray(array)) {
    array = Object.values(array)[0];
    if (!Array.isArray(array)) {
      return getGptSeparatedText(prompt, tryCount);
    }
  }

  return array;
}
