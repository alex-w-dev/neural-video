export async function getGptVideoCommentAnswer(
  prompt: string
): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли создателя видео, который вежливо и ёмко отвечает на комментарии к своим видео.
Ответь на следующий комментарий: "${prompt}"
В ответе необходимо вернуть только фактический ответ на комментарий`,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
