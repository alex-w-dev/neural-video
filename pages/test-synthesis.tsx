import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { getSpeechSynthesis } from "@/src/utils/api/get-speech-synthesis";

export default function TestSynthesis() {
  const [prompt, setPrompt] = useState(
    (typeof window !== "undefined" && localStorage.getItem("TestSynthesis")) ||
      ""
  );
  const [audioSrc, setAudioSrc] = useState("");
  const [makingRequest, setMakingRequest] = useState(false);
  const onGenerate = useCallback(async () => {
    if (!prompt) {
      return;
    }
    setMakingRequest(true);

    const src = await getSpeechSynthesis(prompt);
    setAudioSrc("http://localhost:3000/api/get-file?path=" + src);

    setMakingRequest(false);
  }, [prompt]);

  return (
    <Main>
      <h1>Test Synthesis</h1>
      <Form>
        <textarea
          disabled={makingRequest}
          value={prompt}
          onChange={(e) => (
            localStorage.setItem("TestSynthesis", e.target.value),
            setPrompt(e.target.value)
          )}
        />
        <button disabled={makingRequest} onClick={onGenerate}>
          Synthesis
        </button>
      </Form>
      <div>
        {audioSrc ? (
          <audio src={audioSrc} autoPlay controls={true}>
            Ваш браузер не поддерживает элемент <code>audio</code>.
          </audio>
        ) : (
          "No Audion"
        )}
      </div>
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
