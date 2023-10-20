import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { getEnText } from "@/src/utils/get-en-text";
import { MOBILE_IMAGE_HEIGHT, MOBILE_IMAGE_WIDTH } from "@/src/constants/sizes";

export default function TestKandinskyImageToImage() {
  const [prompt, setPrompt] = useState("");
  const [imageName, setImageName] = useState("");
  const [priorCFScale, setPriorCFScale] = useState("0.5");
  const [strength, setStrength] = useState("0.5");
  const [guidanceScale, setGuidanceScale] = useState("7");
  const [priorSteps, setPriorSteps] = useState("25");
  const [decoderSteps, setDecoderSteps] = useState("50");
  const [imagesCount, setImagesCount] = useState("1");
  const [imgs, setImgs] = useState([]);
  const [makingRequest, setMakingRequest] = useState(false);

  const onGenerate = useCallback(async () => {
    if (!prompt) {
      return;
    }

    setMakingRequest(true);

    const translated = await getEnText(prompt);
    const result = await fetch(
      `http://localhost:5000/img2img?prompt=${encodeURI(
        translated
      )}&prior_cf_scale=${priorCFScale}&guidance_scale=${guidanceScale}&strength=${strength}&image_name=${imageName}&images_count=${imagesCount}&prior_steps=${priorSteps}&decoder_steps=${decoderSteps}&w=${MOBILE_IMAGE_WIDTH}&h=${MOBILE_IMAGE_HEIGHT}`
    );
    const data = await result.json();

    setMakingRequest(false);
    setImgs(data.map((i: any) => `http://localhost:5000/img/${i.file_name}`));
  }, [
    priorCFScale,
    priorSteps,
    decoderSteps,
    guidanceScale,
    imagesCount,
    prompt,
    strength,
    imageName,
  ]);

  return (
    <Main>
      <h1>Test Kandinsky Image to Image</h1>
      <Form>
        <table>
          <tbody>
            <tr>
              <td>Image Name</td>
              <td>
                <textarea
                  disabled={makingRequest}
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Prompt</td>
              <td>
                <textarea
                  disabled={makingRequest}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Prior CF scale</td>
              <td>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={priorCFScale}
                  onChange={(e) => setPriorCFScale(e.target.value)}
                />
                <output>{priorCFScale}</output>
              </td>
            </tr>
            <tr>
              <td>Strength</td>
              <td>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                />
                <output>{strength}</output>
              </td>
            </tr>
            <tr>
              <td>Guidance scale</td>
              <td>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(e.target.value)}
                />
                <output>{guidanceScale}</output>
              </td>
            </tr>
            <tr>
              <td>Prior Steps</td>
              <td>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={priorSteps}
                  onChange={(e) => setPriorSteps(e.target.value)}
                />
                <output>{priorSteps}</output>
              </td>
            </tr>
            <tr>
              <td>Decoder Steps</td>
              <td>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={decoderSteps}
                  onChange={(e) => setDecoderSteps(e.target.value)}
                />
                <output>{decoderSteps}</output>
              </td>
            </tr>
            <tr>
              <td>Images Count</td>
              <td>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={imagesCount}
                  onChange={(e) => setImagesCount(e.target.value)}
                />
                <output>{imagesCount}</output>
              </td>
            </tr>
          </tbody>
        </table>
        <button disabled={makingRequest} onClick={onGenerate}>
          Generate
        </button>
      </Form>
      <div>
        {imgs.length
          ? imgs.map((img) => <img key={img} src={img} alt="" />)
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
