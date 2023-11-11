export async function getGptYoutubeVideoKeywords(
  videTitle: string,
  videDescription: string
): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли SEO (англ. Search Engine Optimization) специалиста. Выша задача придумать более 10 ключевых слов для Youtube видео с названием "${videTitle}".
Вот содержание видео "${videDescription.replaceAll(
          '"',
          "'"
        )}", которое сгенерировала неросеть.
Ответ должен быть без повторанеия вопроса - только ответ.
В ответе ключевые слова должны быть через запятую (например "ключевое слово,слово,видео")`,
      }),
    })
  );
  const data = await result.json();

  return data.message.replace(/^"|"$|\.$/g, "").replace(/[:;]/g, ",");
}
