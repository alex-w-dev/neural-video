import React, { useCallback, useState } from "react";
import styled from "styled-components";

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

    const result = await window.fetch(
      new Request("/api/chat-gpt-3/get-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          message: `Раздели следующий текст на равные части для иллюстрации: "${prompt}"
Иллюстрация должна занимать от 50 до 100 символов от исходного текста. Весть текст должен быть покрыт иллюстрациями
Ответ должен быть в JSON формате и быть массивом объектов, где каждый объект это параметры иллюстрации.
Объект параметров иллюстрации должен содержать следующие свойства: fragment - часть текста для которого делается иллюстрация, prompt - что должно быть изображено в иллюстрации: детальное описание картинки по принципу: изображаемый предмет с деталями, фон на котором изображается предмет" ( без глаголов, не менее 10 слов)`,
        }),
      })
    );
    const data = await result.json();

    setMakingRequest(false);
    setAnswer(data.message);
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
