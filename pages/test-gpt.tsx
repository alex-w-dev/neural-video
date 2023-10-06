import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";

export default function TestGpt() {
  const [prompt, setPrompt] = useState(
    (typeof window !== "undefined" && localStorage.getItem("TestGpt")) || ""
  );
  const [answer, setAnswer] = useState("");
  const [makingRequest, setMakingRequest] = useState(false);
  const onGenerate = useCallback(async () => {
    if (!prompt) {
      return;
    }
    setMakingRequest(true);

    /*const result = await window.fetch(
      new Request("/api/chat-gpt-3/get-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ message: prompt }),
      })
    );
    const data = await result.json();

    setAnswer(data.message);*/

    const sceintist = await getGptScientistAnswer(prompt);
    setAnswer(sceintist);

    setMakingRequest(false);
  }, [prompt]);

  return (
    <Main>
      <h1>Test GPT</h1>
      <Form>
        <textarea
          disabled={makingRequest}
          value={prompt}
          onChange={(e) => (
            localStorage.setItem("TestGpt", e.target.value),
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
