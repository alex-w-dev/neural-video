import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import {
  CurrentVideoStore,
  currentVideoStore,
} from "@/src/stores/current-video.store";
import { JustInClient } from "@/src/components/just-in-client";

type Fragment = CurrentVideoStore["fragments"][0];

export default observer(function VideoCreator() {
  const [makingVideo, setMakingVideo] = useState(false);
  const [loadingFragment, setLoadingFragment] = useState(
    null as null | Fragment
  );

  const onGenerate = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    await currentVideoStore.regenerateScientistAnswer();

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

    await currentVideoStore.splitScientistAnswerToFrames();

    await currentVideoStore.regenerateFramesContents();

    setMakingVideo(false);
  }, []);

  const onRegeneratePrompt = useCallback(async (fragment: Fragment) => {
    setLoadingFragment(fragment);
    await currentVideoStore.regenerateFramePrompt(fragment);
    setLoadingFragment(null);
  }, []);

  const onRegenerateImage = useCallback(
    async (fragment: CurrentVideoStore["fragments"][0]) => {
      setLoadingFragment(fragment);
      await currentVideoStore.regenerateFrameImgSrc(fragment);
      setLoadingFragment(null);
    },
    []
  );

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
        <FramesContainer>
          {currentVideoStore.fragments.length
            ? currentVideoStore.fragments.map((fragment) => {
                const fragmentIsLoading = fragment === loadingFragment;
                return (
                  <div
                    key={fragment.fragment}
                    style={{ opacity: fragmentIsLoading ? ".5" : "1" }}
                  >
                    <div>{fragment.fragment}</div>
                    <div>
                      {fragment.prompt || "No Prompt"}{" "}
                      <button
                        disabled={fragmentIsLoading}
                        onClick={() => onRegeneratePrompt(fragment)}
                      >
                        Renew
                      </button>
                    </div>
                    <div>
                      {fragment.imgSrc ? (
                        <>
                          <img src={fragment.imgSrc} alt="" />
                          <button
                            disabled={fragmentIsLoading}
                            onClick={() => onRegenerateImage(fragment)}
                          >
                            Renew
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })
            : "No Frames"}
        </FramesContainer>
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

const FramesContainer = styled.div`
  max-width: 100vw;
  overflow: auto;
  display: flex;

  img {
    max-width: 400px;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
