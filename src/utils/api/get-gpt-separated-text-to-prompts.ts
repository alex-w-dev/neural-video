import { getJsonFromGptAnswer } from "@/src/utils/get-json-from-gpt-answer";

export async function getGptSeparatedTextToPrompts(
  prompt: string,
  tryCount = 0
): Promise<Array<{ prompt: string; fragment: string }> | null> {
  if (tryCount++ > 5) {
    return null;
  }

  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Раздели следующий текст на равные части от 40 до 70 символов: "${prompt}"
Для каждой части нужно предложить идею картинки, ка которой изображено что-то реальное оносящееся к этой части текста.
Ответ должен быть в JSON формате и быть массивом объектов, где каждый объект это параметры части текста.
Объект параметров иллюстрации должен содержать следующие свойства: fragment - часть текста для которого делается картинка, prompt - строка содержащая то, что должно быть изображено в картинке по формуле содержащей 4 части разделенных запятыми: "изображаемый предмет(ы) с описанием, задний фон, дополнительное описание"`,
      }),
    })
  );
  const data = await result.json();

  let array = getJsonFromGptAnswer(data.message);

  if (!array) {
    return getGptSeparatedTextToPrompts(prompt, tryCount);
  }

  if (!Array.isArray(array)) {
    array = Object.values(array)[0];
    if (!Array.isArray(array)) {
      return getGptSeparatedTextToPrompts(prompt, tryCount);
    }
  }

  return array;
}
