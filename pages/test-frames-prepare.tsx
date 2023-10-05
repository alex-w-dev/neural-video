import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getGptSeparatedTextToPrompts } from "@/src/utils/api/get-gpt-separated-text-to-prompts";

export default function TestFramesPrepare() {
  const [prompt, setPrompt] = useState(
    (typeof window !== "undefined" &&
      localStorage.getItem("TestFramesPrepare")) ||
      ""
  );
  const [answer, setAnswer] = useState("");
  const [makingRequest, setMakingRequest] = useState(false);
  const onGenerate = useCallback(async () => {
    if (!prompt) {
      return;
    }
    setMakingRequest(true);
    const answer = await getGptSeparatedTextToPrompts(prompt);
    setAnswer(JSON.stringify(answer));
    setMakingRequest(false);
  }, [prompt]);

  return (
    <Main>
      <h1>Test Frames Prepare</h1>
      <Form>
        <textarea
          disabled={makingRequest}
          value={prompt}
          onChange={(e) => (
            localStorage.setItem("TestFramesPrepare", e.target.value),
            setPrompt(e.target.value)
          )}
        />
        <button disabled={makingRequest} onClick={onGenerate}>
          Answer
        </button>
      </Form>
      <div>{answer ? answer : "No Answer"}</div>
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
