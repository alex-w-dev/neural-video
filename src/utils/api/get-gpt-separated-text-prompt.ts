import { getJsonFromGptAnswer } from "@/src/utils/get-json-from-gpt-answer";
import { Fragment } from "@/src/interfaces/common";

export async function getGptSeparatedTextPrompt(
  fullText: string,
  fragment: string
): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли художника-иллюстратора. Ваша задача придумать картинку к фрагменту текста.
Дополнительные данные можно взять из этого текста: \`\`\`${fullText.replaceAll(
          '"',
          "'"
        )}\`\`\`.
Вот приоритетный текст к которому нужно придумать картинку: \`\`\`${fragment.replaceAll(
          '"',
          "'"
        )}\`\`\`.
Ответ должен быть выстроен по формуле: <изображаемый предмет>, <произвольные отличительные признаки присущие предмету>, <фон на котором изобаражен предмет>
Я хочу чтобы ответы были без повторения вопроса - только ответ. Ответ не должен содержать составляюшие формулы - только результат. В ответе должны быть только значения формулы. В ответе не должно быть "ключ: значение" - только значение.
Вот пример ответов: "птица, золотые крылья, на фоне бушующего моря" или "космический корабль, включенный варп-двигатель, космическое пространство рядом с марсом"`,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
