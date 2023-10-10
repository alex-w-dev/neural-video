export async function getGptScientistAnswer(prompt: string): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: `Вы выступаете в роли ученого, который подробно понятным языком рассказывает обо всём на свете. Ответ должен быть без посторанеия вопроса - только ответ. Сделай ответ длиной не менее 500 символов.
Вот мой первый вопрос: "${prompt}"`,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
