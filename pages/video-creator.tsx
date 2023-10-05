import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { getGptSeparatedTextToPrompts } from "@/src/utils/api/get-gpt-separated-text-to-prompts";
import { getKandinskyBaseImage } from "@/src/utils/api/get-kandinsky-base-image";
import { consoleImage } from "@/src/utils/console-image";

export default function VideoCreator() {
  const [prompt, setPrompt] = useState(
    (typeof window !== "undefined" && localStorage.getItem("VideoCreator")) ||
      ""
  );
  const [scientistAnswer, setScientistAnswer] = useState("");
  const [makingVideo, setMakingVideo] = useState(false);

  const onGenerate = useCallback(async () => {
    if (!prompt) {
      return;
    }
    setMakingVideo(true);

    console.log("Getting AI answer...");
    const scientistAnswer = await getGptScientistAnswer(prompt);
    setScientistAnswer(scientistAnswer);
    console.log(`Scientist answer is: ${scientistAnswer}`);

    console.log("Getting formatted JSON...");
    const generatedFragments = await getGptSeparatedTextToPrompts(
      scientistAnswer
    );
    console.log("Separated text is: ", generatedFragments);

    if (generatedFragments) {
      console.log("Getting images...");
      for (const fragment of generatedFragments) {
        console.log(`Getting image for prompt: ${fragment.prompt} ...`);
        const src = await getKandinskyBaseImage(fragment.prompt);
        console.log(`Got ${src}:`);
        await consoleImage(src, 100);
      }
    }

    setMakingVideo(false);
  }, [prompt]);

  return (
    <Main>
      <h1>Video Creator</h1>
      <Form>
        <textarea
          disabled={makingVideo}
          value={prompt}
          onChange={(e) => (
            localStorage.setItem("VideoCreator", e.target.value),
            setPrompt(e.target.value)
          )}
        />
        <button disabled={makingVideo} onClick={onGenerate}>
          Answer
        </button>
      </Form>
      <div>{scientistAnswer ? scientistAnswer : "No Answer"}</div>
    </Main>
  );
}

const Form = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;

  textarea {
    width: 350px;
    height: 86px;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
