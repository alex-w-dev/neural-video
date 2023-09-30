import React, { useCallback, useState } from "react";
import styled from "styled-components";

export default function Drew() {
  const [prompt, setPrompt] = useState("");
  const [img, setImg] = useState("");
  const [makingRequest, setMakingRequest] = useState(false);
  const onGenerate = useCallback(async () => {
    setMakingRequest(true);
    const result = await fetch(
      `http://localhost:5000/text2img?prompt=${encodeURI(prompt)}`
    );
    const data = await result.json();

    setMakingRequest(false);
    setImg(`http://localhost:5000/img/${data[0].file_name}`);
  }, [prompt]);

  return (
    <Main>
      <h1>Test Kandinsky</h1>
      <Form>
        <textarea
          disabled={makingRequest}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button disabled={makingRequest} onClick={onGenerate}>
          Generate
        </button>
      </Form>
      <div>{img ? <img src={img} alt="" /> : "No Image"}</div>
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
