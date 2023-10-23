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
import { uploadVideo } from "@/src/utils/api/upload-video";
import { getYoutubeOauth } from "@/src/utils/api/get-youtube-oauth";
import { getYoutubeOauthLink } from "@/src/utils/api/get-youtube-oauth-link";
import { commentVideo } from "@/src/utils/api/comment-video";

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

    await currentVideoStore.regenerateScientistAnswerDescription();
    await currentVideoStore.remakeSeo();
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

    await currentVideoStore.clearFragmentImages();
    await currentVideoStore.regenerateFramesPromptsAndImages();

    setMakingVideo(false);
  }, []);

  const onRenewFramesTransitions = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    await currentVideoStore.regenerateFramesImagesTransition();

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

  const onRegenerateImageTransition = useCallback(
    async (fragment: Fragment) => {
      setLoadingFragment(fragment);
      await currentVideoStore.regenerateFrameTransitImages(fragment);
      setLoadingFragment(null);
    },
    []
  );

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

  const onUploadVideo = useCallback(async () => {
    setMakingVideo(true);
    console.log("Start uploading ...");
    const returns = await uploadVideo({
      title: currentVideoStore.youtubeTitle,
      tags: currentVideoStore.youtubeTags,
      videoFilePath: currentVideoStore.videFilePath,
      description: currentVideoStore.youtubeDescription,
    });
    console.log("Commenting video " + returns.data.id + " ...");
    await commentVideo({
      videoId: returns.data.id,
      text: `Дорогие друзья, это видео сделано несколькими нейросетями: Chat GPT 3.5, Kandinsky 2.2 и SaluteSpeech.
А ChatGPT еще и периодически подключается к комментариям, тем самым давая возможность пообщаться с ней!`,
    });
    setMakingVideo(false);
  }, []);

  const onCheckAuth = useCallback(async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await getYoutubeOauth();
      alert("Login Success");
    } catch (e) {
      const a = document.createElement("a");
      a.target = "_blank";
      a.href = getYoutubeOauthLink();
      a.click();
    }
  }, []);

  const onClearAllData = useCallback(() => {
    const prompt = currentVideoStore.prompt;
    currentVideoStore.clearAllData();
    currentVideoStore.setPrompt(prompt);
  }, []);

  const onJustAnswer = useCallback(async () => {
    if (!currentVideoStore.prompt) {
      return;
    }
    setMakingVideo(true);

    onClearAllData();

    await currentVideoStore.regenerateScientistAnswer();

    setMakingVideo(false);
  }, [onClearAllData]);

  const onFullDataGeneration = useCallback(async () => {
    onClearAllData();
    await onJustAnswer();
    await onGenerate();
    await onRenewFrames();
    await onRenewFramesData();
  }, [
    onJustAnswer,
    onClearAllData,
    onGenerate,
    onRenewFrames,
    onRenewFramesData,
  ]);

  return (
    <JustInClient>
      <Main>
        <h1>Video Creator</h1>
        <button onClick={onClearAllData}>Clear ALL DATA</button>
        <Form>
          <textarea
            disabled={makingVideo}
            value={currentVideoStore.prompt}
            onChange={(e) => (
              localStorage.setItem("VideoCreator", e.target.value),
              currentVideoStore.setPrompt(e.target.value)
            )}
          />
          <div>
            <button disabled={makingVideo} onClick={onJustAnswer}>
              Just Answer
            </button>
            <hr />
            <button disabled={makingVideo} onClick={onGenerate}>
              Add SEO
            </button>
            <hr />
            <button disabled={makingVideo} onClick={onFullDataGeneration}>
              Answer completely!
            </button>
          </div>
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
          (length: {currentVideoStore.youtubeTitle.length})
          {currentVideoStore.youtubeTitle}
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
              <button disabled={makingVideo} onClick={onRenewFramesTransitions}>
                Renew all frames TRANSITIONS
              </button>
              {currentVideoStore.fragments.map((fragment) => {
                const fragmentIsLoading = fragment === loadingFragment;
                return (
                  <div
                    key={fragment.fragment}
                    style={{ opacity: fragmentIsLoading ? ".5" : "1" }}
                  >
                    <div>
                      ({fragment.fragment.length}){fragment.fragment}{" "}
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
                      <button
                        disabled={fragmentIsLoading}
                        onClick={() => onRegenerateImageTransition(fragment)}
                      >
                        Regenerate image Transition
                      </button>
                    </div>
                    <hr />
                    <TransitionImagesContainer>
                      {fragment.transitPreImages
                        ? fragment.transitPreImages.map((image) => (
                            <img key={image.src} src={image.src} alt="" />
                          ))
                        : null}
                    </TransitionImagesContainer>
                    <hr />
                    <div>
                      {fragment.image ? (
                        <>
                          <img src={fragment.image.src} alt="" />
                        </>
                      ) : null}
                    </div>
                    <hr />
                    <TransitionImagesContainer>
                      {fragment.transitPostImages
                        ? fragment.transitPostImages.map((image) => (
                            <img key={image.src} src={image.src} alt="" />
                          ))
                        : null}
                    </TransitionImagesContainer>
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
        <div>
          <a href={"#"} onClick={onCheckAuth}>
            Check Auth
          </a>
        </div>
        <div>
          {currentVideoStore.youtubeDescription &&
          currentVideoStore.youtubeKeywords &&
          currentVideoStore.videFilePath &&
          currentVideoStore.youtubeTitle ? (
            <button onClick={onUploadVideo}>Upload to Youtube</button>
          ) : (
            "Cannot to Upload - no required prams"
          )}
        </div>
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
    min-width: 80vw;
    height: 86px;
  }
`;

const TransitionImagesContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-y: auto;

  img {
    width: 400px;
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
