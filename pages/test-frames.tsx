import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getEnText } from "@/src/utils/get-en-text";
import { Fragment, FragmentImage } from "@/src/interfaces/common";

export default function TestFrames() {
  const [json, setJson] = useState(
    (typeof window !== "undefined" && localStorage.getItem("TestFrames")) || ""
  );
  const [imgs, setImgs] = useState<Array<FragmentImage>>([]);
  const [status, setStatus] = useState("");
  const [makingRequest, setMakingRequest] = useState(false);
  const onGenerate = useCallback(async () => {
    if (!json) {
      return;
    }

    setMakingRequest(true);

    const fragments: Fragment[] = JSON.parse(json);
    const images: FragmentImage[] = [];

    for (const fragment of fragments) {
      const index = fragments.indexOf(fragment);
      setStatus(`making ${index + 1} of ${fragments.length}`);

      const translated = await getEnText(fragment.prompt);
      const result = await fetch(
        `http://localhost:5000/text2img?prompt=${encodeURI(translated)}`
      );
      const data = await result.json();
      images.push({
        ...fragment,
        src: `http://localhost:5000/img/${data[0].file_name}`,
      });
      setImgs(images);
    }

    setStatus(``);
    setMakingRequest(false);
    setImgs(images);
  }, [json]);

  return (
    <Main>
      <h1>Test Frames</h1>
      <Form>
        <textarea
          disabled={makingRequest}
          value={json}
          onChange={(e) => (
            localStorage.setItem("TestFrames", e.target.value),
            setJson(e.target.value)
          )}
        />
        <button disabled={makingRequest} onClick={onGenerate}>
          Generate
        </button>
      </Form>
      <div>status: {status ? status : "None"}</div>
      <div>
        {imgs.length
          ? imgs.map((img) => (
              <div key={img.fragment}>
                <div>
                  {img.fragment} (${img.prompt})
                </div>
                <div>
                  <img src={img.src} alt={img.prompt} />
                </div>
              </div>
            ))
          : "No Images"}
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
