import { SynthesisVoiceEnum } from "@/src/constants/synthesis-voice.enum";

export async function getSpeechSynthesis(
  prompt: string,
  voice: SynthesisVoiceEnum = SynthesisVoiceEnum.Alexandra
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
