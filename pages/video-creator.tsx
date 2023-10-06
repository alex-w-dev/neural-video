import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { getGptSeparatedTextToPrompts } from "@/src/utils/api/get-gpt-separated-text-to-prompts";
import { getKandinskyBaseImage } from "@/src/utils/api/get-kandinsky-base-image";
import { consoleImage } from "@/src/utils/console-image";
import { observer } from "mobx-react-lite";
import { currentVideoStore } from "@/src/stores/current-video.store";
import { getGptSeparatedText } from "@/src/utils/api/get-gpt-separated-text";
import { JustInClient } from "@/src/components/just-in-client";
import { getGptSeparatedTextPrompt } from "@/src/utils/api/get-gpt-separated-text-prompt";
import { getGptShorterText } from "@/src/utils/api/get-gpt-shorter-text";

export default observer(function VideoCreator() {
  const [makingVideo, setMakingVideo] = useState(false);

  const onGenerate = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    console.log(`Getting AI answer (${currentVideoStore.prompt})...`);
    currentVideoStore.setScientistAnswer(
      await getGptScientistAnswer(currentVideoStore.prompt)
    );
    console.log(`Scientist answer is: ${currentVideoStore.scientistAnswer}`);

    // if (currentVideoStore.scientistAnswer.length > 600) {
    //   console.log(
    //     `Making scientist's answer (${currentVideoStore.scientistAnswer.length}) shorter...`
    //   );
    //   currentVideoStore.setScientistAnswer(
    //     await getGptShorterText(currentVideoStore.scientistAnswer)
    //   );
    //
    //   console.log(
    //     `Now scientist answer length is ${currentVideoStore.scientistAnswer.length}: ${currentVideoStore.scientistAnswer}`
    //   );
    // }

    console.log("Getting separated text...");
    const separatedText = await getGptSeparatedText(
      currentVideoStore.scientistAnswer
    );
    currentVideoStore.initFragments(separatedText);
    console.log("Separated text is: ", separatedText);

    console.log("Getting  prompts and images to text fragments");
    for (const fragment of currentVideoStore.fragments) {
      console.log(`Getting prompt for text: ${fragment.fragment}...`);
      const prompt = await getGptSeparatedTextPrompt(
        currentVideoStore.scientistAnswer,
        fragment.fragment
      );
      currentVideoStore.setFragmentPrompt(fragment, prompt);

      console.log(`Getting image for prompt: ${prompt} ...`);
      const src = await getKandinskyBaseImage(prompt);
      currentVideoStore.setFragmentImgSrc(fragment, src);
      console.log(`Got ${src}:`);
      await consoleImage(src, 100);
    }

    setMakingVideo(false);
  }, []);

  return (
    <JustInClient>
      <Main>
        <h1>Video Creator</h1>
        <Form>
          <textarea
            disabled={makingVideo}
            value={currentVideoStore.prompt}
            onChange={(e) => (
              localStorage.setItem("VideoCreator", e.target.value),
              currentVideoStore.setPrompt(e.target.value)
            )}
          />
          <button disabled={makingVideo} onClick={onGenerate}>
            Answer
          </button>
        </Form>
        <div>
          {currentVideoStore.scientistAnswer
            ? currentVideoStore.scientistAnswer
            : "No Answer"}
        </div>
      </Main>
    </JustInClient>
  );
});

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
