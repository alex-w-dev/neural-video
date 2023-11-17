import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { JustInClient } from "@/src/components/just-in-client";
import { uploadVideo } from "@/src/utils/api/upload-video";
import { getYoutubeOauthLink } from "@/src/utils/api/get-youtube-oauth-link";
import { youtubeLoaderStore } from "@/src/stores/youtube-loader.store";
import { TopNav } from "@/src/components/top-nav";

export default observer(function VideoCreator() {
  const [makingVideo, setMakingVideo] = useState(false);

  const onGenerate = useCallback(async () => {
    if (!youtubeLoaderStore.prompt) {
      return;
    }
    setMakingVideo(true);

    await youtubeLoaderStore.regenerateScientistAnswerDescription();
    await youtubeLoaderStore.remakeSeo();

    setMakingVideo(false);
  }, []);

  const onRegenerateAudio = useCallback(async () => {
    setMakingVideo(true);
    await youtubeLoaderStore.regenerateAudioSrc();
    setMakingVideo(false);
  }, []);

  const onReMakeDescription = useCallback(async () => {
    setMakingVideo(true);
    await youtubeLoaderStore.regenerateScientistAnswerDescription();
    setMakingVideo(false);
  }, []);

  const onRemakeSeo = useCallback(async () => {
    setMakingVideo(true);
    await youtubeLoaderStore.remakeSeo();
    setMakingVideo(false);
  }, []);

  const onUploadVideo = useCallback(async () => {
    setMakingVideo(true);
    console.log("Start uploading ...");
    const returns = await uploadVideo({
      title: youtubeLoaderStore.youtubeTitle,
      tags: youtubeLoaderStore.youtubeTags,
      videoFilePath: youtubeLoaderStore.videoFilePath,
      description: youtubeLoaderStore.youtubeDescription,
    });
    setMakingVideo(false);
  }, []);

  const onCheckAuth = useCallback(async (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    const a = document.createElement("a");
    a.target = "_blank";
    a.href = getYoutubeOauthLink();
    a.click();
  }, []);

  const onClearAllData = useCallback(() => {
    const prompt = youtubeLoaderStore.prompt;
    youtubeLoaderStore.clearAllData();
    youtubeLoaderStore.setPrompt(prompt);
  }, []);

  const onDownloadAudio = useCallback(async () => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = youtubeLoaderStore.audioSrc;
    document.body.appendChild(a);
    a.download = "audio.mp3";
    a.click();
  }, []);

  const onJustAnswer = useCallback(async () => {
    if (!youtubeLoaderStore.prompt) {
      return;
    }
    setMakingVideo(true);

    onClearAllData();

    await youtubeLoaderStore.regenerateScientistAnswer();

    setMakingVideo(false);
  }, [onClearAllData]);

  const onFullDataGeneration = useCallback(async () => {
    onClearAllData();
    await onJustAnswer();
    await onGenerate();
  }, [onJustAnswer, onClearAllData, onGenerate]);

  return (
    <JustInClient>
      <TopNav />
      <Main>
        <h1>Youtube Loader</h1>
        <button onClick={onClearAllData}>Clear ALL DATA</button>

        <Form>
          <textarea
            disabled={makingVideo}
            value={youtubeLoaderStore.prompt}
            onChange={(e) => (
              localStorage.setItem("VideoCreator", e.target.value),
              youtubeLoaderStore.setPrompt(e.target.value)
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
          <>
            (length: {youtubeLoaderStore.scientistAnswer.length})(time:{" "}
            {Math.round(youtubeLoaderStore.scientistAnswer.length / 15.5)}sec){" "}
            {Math.round(youtubeLoaderStore.scientistAnswer.length / 15.5 / 3.5)}
            frames){" "}
            <textarea
              onChange={(e) => {
                youtubeLoaderStore.setScientistAnswer(e.target.value);
              }}
              value={youtubeLoaderStore.scientistAnswer}
              className="h100"
            />
            <div>
              <button disabled={makingVideo} onClick={onReMakeDescription}>
                Renew description
              </button>
              <button disabled={makingVideo} onClick={onRemakeSeo}>
                remake SEO
              </button>
            </div>
          </>
        </div>
        <div>
          <>
            (length: {youtubeLoaderStore.scientistAnswerDescription.length}){" "}
            {youtubeLoaderStore.scientistAnswerDescription}
          </>
        </div>
        <div>
          (length: {youtubeLoaderStore.youtubeTitle.length})
          {youtubeLoaderStore.youtubeTitle}
        </div>
        <div>
          {youtubeLoaderStore.youtubeDescription ? (
            <>(Youtube Description) {youtubeLoaderStore.youtubeDescription}</>
          ) : (
            "No youtubeDescription"
          )}
        </div>
        <div>
          {youtubeLoaderStore.youtubeKeywords ? (
            <>(Youtube Keywords) {youtubeLoaderStore.youtubeKeywords}</>
          ) : (
            "No youtubeKeywords"
          )}
        </div>
        <div>
          {youtubeLoaderStore.audioSrc ? (
            <>
              Duration: <output>{youtubeLoaderStore.audioDurationMs}</output>ms
              <button onClick={onDownloadAudio}>Download</button> -
              <audio src={youtubeLoaderStore.audioSrc} controls></audio>
            </>
          ) : (
            "No Audio"
          )}{" "}
          <button
            disabled={makingVideo || !youtubeLoaderStore.scientistAnswer}
            onClick={onRegenerateAudio}
          >
            Regenerate Audio
          </button>
        </div>
        <div>
          <div>
            System video file path:{" "}
            <input
              type="text"
              disabled={makingVideo}
              value={youtubeLoaderStore.videoFilePath}
              onChange={(e) =>
                youtubeLoaderStore.setVideoFilePath(e.target.value)
              }
            />
          </div>
          <VideoContainer>
            {youtubeLoaderStore.videoSrc && (
              <Video src={youtubeLoaderStore.videoSrc} controls></Video>
            )}
          </VideoContainer>
        </div>
        <div>
          <a href={"#"} onClick={onCheckAuth}>
            Check Auth
          </a>
        </div>
        <div>
          {youtubeLoaderStore.youtubeDescription &&
          youtubeLoaderStore.youtubeKeywords &&
          youtubeLoaderStore.videoFilePath &&
          youtubeLoaderStore.youtubeTitle ? (
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

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;

  & > div {
    width: 100%;
  }

  textarea {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    border: 1px solid #093b0d;
  }
  .h100 {
    height: 100px;
  }
`;
