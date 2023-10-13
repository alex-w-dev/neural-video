export async function getGptYoutubeVideoKeywords(
  question: string,
  answer: string
): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли SEO (англ. Search Engine Optimization) специалиста. Выша задача придумать более 10 ключевых слов для Youtube видео в котором нейросеть отвечает на вопрос "${question}".
Вот содержание видео "${answer.replaceAll(
          '"',
          "'"
        )}", которое сгенерировала неросеть.
Ответ должен начинаться со слов "Нейросеть спросили".
Ответ должен быть без повторанеия вопроса - только ответ.
В ответе ключевые слова должны быть через запятую (например "ключевое слово,слово,видео")`,
      }),
    })
  );
  const data = await result.json();

  return data.message.replace(/^"|"$|\.$/g, "").replace(/[:;]/g, ",");
}
