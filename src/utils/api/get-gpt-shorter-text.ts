export async function getGptShorterText(prompt: string): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли профессионального копирайтера, ваша задача делать длинные тексты короткими без потери смысла. Я хочу чтобы ответы были без повторения вопроса - только ответ.
Сделайте короче этот текст: "${prompt}"`,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
