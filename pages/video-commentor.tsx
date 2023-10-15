import React, { useCallback, useEffect, useState } from "react";
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
import { checkAndAnswerChannelComments } from "@/src/utils/api/check-and-answer-channel-comments";

type Fragment = CurrentVideoStore["fragments"][0];

export default observer(function VideoCreator() {
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());
  const onCommentsCheck = useCallback(async () => {
    await checkAndAnswerChannelComments();
    console.log(
      `Comments Checked and answered`,
      "`Comments Checked and answered`"
    );
    setLastCheck(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      onCommentsCheck();
    }, 300_000);

    return () => clearInterval(interval);
  }, [onCommentsCheck]);

  return (
    <JustInClient>
      <Main>
        <h1>Video Checker</h1>
        <div>Last check ${lastCheck}</div>
        <button onClick={onCommentsCheck}>Check Now</button>
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
