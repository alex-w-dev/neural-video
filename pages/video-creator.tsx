import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import {
  CurrentVideoStore,
  currentVideoStore,
} from "@/src/stores/current-video.store";
import { JustInClient } from "@/src/components/just-in-client";
import { VideoRecorder } from "@/src/components/video-recorder";
import { VideRecorderOnReadyData } from "@/src/interfaces/common";

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
    await currentVideoStore.regenerateScientistAnswerDescription();

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

    setMakingVideo(false);
  }, []);

  const onRenewFrames = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    await currentVideoStore.splitScientistAnswerToFrames();

    setMakingVideo(false);
  }, []);

  const onRenewFramesData = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    await currentVideoStore.regenerateFramesContents();

    setMakingVideo(false);
  }, []);

  const onRegeneratePrompt = useCallback(async (fragment: Fragment) => {
    setLoadingFragment(fragment);
    await currentVideoStore.regenerateFramePrompt(fragment);
    await currentVideoStore.regenerateFrameImgSrc(fragment);
    setLoadingFragment(null);
  }, []);

  const onRegenerateImage = useCallback(async (fragment: Fragment) => {
    setLoadingFragment(fragment);
    await currentVideoStore.regenerateFrameImgSrc(fragment);
    setLoadingFragment(null);
  }, []);

  const onRegenerateAudio = useCallback(async () => {
    setMakingVideo(true);
    await currentVideoStore.regenerateAudioSrc();
    setMakingVideo(false);
  }, []);

  const onReMakeDescription = useCallback(async () => {
    setMakingVideo(true);
    await currentVideoStore.regenerateScientistAnswerDescription();
    setMakingVideo(false);
  }, []);

  const onVideoReady = useCallback((data: VideRecorderOnReadyData) => {
    currentVideoStore.setVideoFilePath(data.videoFilePath);
  }, []);

  const onRemakeSeo = useCallback(async () => {
    setMakingVideo(true);
    await currentVideoStore.remakeSeo();
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
          {currentVideoStore.scientistAnswer ? (
            <>
              (length: {currentVideoStore.scientistAnswer.length})(time:{" "}
              {Math.round(currentVideoStore.scientistAnswer.length / 15.5)}sec){" "}
              {currentVideoStore.scientistAnswer}
              <div>
                <button disabled={makingVideo} onClick={onReMakeDescription}>
                  Renew description
                </button>
                <button disabled={makingVideo} onClick={onRemakeSeo}>
                  remake SEO
                </button>
              </div>
            </>
          ) : (
            "No Answer"
          )}
        </div>
        <div>
          {currentVideoStore.scientistAnswerDescription ? (
            <>
              (length: {currentVideoStore.scientistAnswerDescription.length}){" "}
              {currentVideoStore.scientistAnswerDescription}
              <button disabled={makingVideo} onClick={onRenewFrames}>
                Renew frames
              </button>
            </>
          ) : (
            "No Description"
          )}
        </div>
        <div>
          {currentVideoStore.youtubeDescription ? (
            <>(Youtube Description) {currentVideoStore.youtubeDescription}</>
          ) : (
            "No youtubeDescription"
          )}
        </div>
        <div>
          {currentVideoStore.youtubeKeywords ? (
            <>(Youtube Keywords) {currentVideoStore.youtubeKeywords}</>
          ) : (
            "No youtubeKeywords"
          )}
        </div>
        <FramesContainer>
          {currentVideoStore.fragments.length ? (
            <>
              <button disabled={makingVideo} onClick={onRenewFramesData}>
                Renew all frames Data
              </button>
              {currentVideoStore.fragments.map((fragment) => {
                const fragmentIsLoading = fragment === loadingFragment;
                return (
                  <div
                    key={fragment.fragment}
                    style={{ opacity: fragmentIsLoading ? ".5" : "1" }}
                  >
                    <div>
                      {fragment.fragment}{" "}
                      <button
                        disabled={fragmentIsLoading}
                        onClick={() => onRegeneratePrompt(fragment)}
                      >
                        New Prompt
                      </button>
                    </div>
                    <hr />
                    <div>
                      {fragment.prompt || "No Prompt"}{" "}
                      <button
                        disabled={fragmentIsLoading}
                        onClick={() => onRegenerateImage(fragment)}
                      >
                        New Image
                      </button>
                    </div>
                    <hr />
                    <div>
                      {fragment.imgSrc ? (
                        <>
                          <img src={fragment.imgSrc} alt="" />
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            "No Frames"
          )}
        </FramesContainer>
        <div>
          {currentVideoStore.audioSrc ? (
            <>
              Duration: <output>{currentVideoStore.audioDurationMs}</output>ms
              <audio src={currentVideoStore.audioSrc} controls></audio>
            </>
          ) : (
            "No Audio"
          )}{" "}
          <button
            disabled={makingVideo || !currentVideoStore.scientistAnswer}
            onClick={onRegenerateAudio}
          >
            Regenerate Audio
          </button>
        </div>
        <hr />
        <VideoContainer>
          <div>
            <VideoRecorder
              audioFilePath={currentVideoStore.audioFilePath}
              images={currentVideoStore.videRecorderImages}
              onVideReady={onVideoReady}
            />
          </div>
          <div>
            {currentVideoStore.videoSrc ? (
              <Video controls src={currentVideoStore.videoSrc} />
            ) : null}
          </div>
        </VideoContainer>
      </Main>
    </JustInClient>
  );
});

const VideoContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;
const Video = styled.video`
  zoom: 0.4;
`;
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
  max-width: 100%;
  overflow: auto;
  display: flex;
  gap: 10px;

  & > div {
    min-width: 400px;
  }

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
