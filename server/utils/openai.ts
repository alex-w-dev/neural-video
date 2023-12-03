import OpenAI from "openai";

import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  // @ts-ignore
} from "openai/src/resources/chat/completions";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://127.0.0.1:8181/v1",
});

console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY);

export async function runCompletion(
  body: Omit<ChatCompletionCreateParamsNonStreaming, "model"> & {
    model?: ChatCompletionCreateParamsNonStreaming["model"];
  }
): Promise<string> {
  let callCount = 0;
  const rCompletion = async (): Promise<ChatCompletion> => {
    try {
      return await openai.chat.completions.create({
        ...body,
        model: body.model || "gpt-3.5-turbo-16k",
      });
    } catch (e) {
      if (callCount++ < 5) {
        console.log("Retry #" + callCount + "...");
        return await rCompletion();
      } else {
        throw e;
      }
    }
  };

  const completion = await rCompletion();

  const answer = completion.choices[0].message.content;

  if (!answer) {
    console.error("no answer");
    console.log(completion);
  }

  return answer || "NO answer";
}

export async function isQuestion(message: string): Promise<boolean> {
  const answer = await runCompletion({
    messages: [
      {
        role: "user",
        content: `Является-ли текст "${message}" вопросом?\n\nОтвет ответ должен быть только цифрой: 0 или 1`,
      },
    ],
  });
  console.log("answer", answer);
  const lastNum = parseInt(answer.replace(/.*?(\d+)[^\d]*$/, "$1"));

  return lastNum === 1;
}

export async function isTextInterestingVideoTheme(
  message: string
): Promise<boolean> {
  const answer = await runCompletion({
    messages: [
      {
        role: "user",
        content: `Является-ли текст "${message}" темой для интересного насыщенного рассказа?\n\nОтвет должен быть только цифрой: 0 или 1`,
      },
    ],
  });
  console.log("answer", answer);
  const lastNum = parseInt(answer.replace(/.*?(\d+)[^\d]*$/, "$1"));

  return lastNum === 1;
}
