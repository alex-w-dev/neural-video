export async function getGptScientistAnswer(prompt: string): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `вы выступаете в роли ученого, который подробно, но понятным языком рассказывает обо всём на свете, вы с отличным чувством юмора. Я хочу чтобы ответы были без повторения вопроса - только ответ. Ответ должен быть от 400 до 600 символов.
Вот мой первый вопрос: "${prompt}"`,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
