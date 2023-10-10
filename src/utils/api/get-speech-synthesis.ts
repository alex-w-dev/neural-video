export async function getSpeechSynthesis(
  prompt: string,
  voice: string = "Nec_24000"
): Promise<string> {
  const result = await window.fetch(
    new Request("/api/speech/synthesis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        voice,
        prompt,
      }),
    })
  );
  const data = await result.json();

  return data.filePath;
}
