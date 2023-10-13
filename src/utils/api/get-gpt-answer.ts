export async function getGptAnswer(prompt: string): Promise<string> {
  const result = await window.fetch(
    new Request("/api/chat-gpt-3/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        message: prompt,
      }),
    })
  );
  const data = await result.json();

  return data.message;
}
