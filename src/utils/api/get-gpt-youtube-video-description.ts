export async function getGptYoutubeVideoDescription(
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
        message: `Вы выступаете в роли SEO (англ. Search Engine Optimization) специалиста. Выша задача придумать хорошее ёмкое описание для Youtube видео в котором нейросеть отвечает на вопрос "${question}".
Вот содержание видео: "${answer.replaceAll(
          '"',
          "'"
        )}", которое сгенерировала неросеть.
Ответ должен начинаться со слов "Нейросеть спросили <вопрос>? - <придуманное описание>".
Ответ должен быть без повторанеия вопроса - только ответ.`,
      }),
    })
  );
  const data = await result.json();

  return data.message.replace(/^"|"$/g, "");
}
