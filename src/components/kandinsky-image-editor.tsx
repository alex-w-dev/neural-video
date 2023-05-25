"use client";

import { useCallback, useState } from "react";
import { getRuFromEn, kandinskyTxt2ImgGenerate } from "@/src/utils/utils";
import { KandinskyTxt2ImgParams } from "@/src/dto/kandinsky-txt-2-img-params";
import { Button, Textarea } from "@material-tailwind/react";

export function KandinskyImageEditor() {
  const [lsKey] = useState("dasdasdasdasd");
  let storageValue;
  try {
    storageValue = JSON.parse(localStorage.getItem(lsKey)!);
  } catch (e) {
    // nothing, just try
  }
  const [kandinskyTxt2ImgParams, setKandinskyTxt2ImgParams] = useState(
    storageValue || new KandinskyTxt2ImgParams()
  );
  const [img, setImg] = useState("");
  const [isGenerating, setIdGenerating] = useState(false);

  const setKandinskyTxt2ImgParamsAndSave = useCallback(
    (params: KandinskyTxt2ImgParams) => {
      setKandinskyTxt2ImgParams(params);
      localStorage.setItem(lsKey, JSON.stringify(params));
    },
    [lsKey]
  );

  const generate = useCallback(
    async (param = kandinskyTxt2ImgParams) => {
      setIdGenerating(true);
      try {
        setImg((await kandinskyTxt2ImgGenerate(param)).file_name);
      } catch (e) {
        console.error(e);
        alert("Some ERRORS on generation!");
      } finally {
        setIdGenerating(false);
      }
    },
    [kandinskyTxt2ImgParams]
  );

  const translateAndGenerate = useCallback(async () => {
    const prompt = await getRuFromEn(kandinskyTxt2ImgParams.prompt_ru);

    const newParams = { ...kandinskyTxt2ImgParams, prompt };
    setKandinskyTxt2ImgParamsAndSave(newParams);

    await generate(newParams);
  }, [setKandinskyTxt2ImgParamsAndSave, generate, kandinskyTxt2ImgParams]);

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      <div>
        <div>
          <Button onClick={translateAndGenerate}>Translate & Generate</Button>
          {isGenerating ? <div>GENERATING...</div> : null}
        </div>
        <table className="w-full">
          <tbody>
            <tr>
              <td>
                prompt_RU <hr />
                высокая детализация, высокое качество, 8k
              </td>
              <td>
                <Textarea
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      prompt_ru: e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.prompt_ru}
                ></Textarea>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <Button onClick={() => generate()}>Generate</Button>
              </td>
            </tr>

            <tr>
              <td>prompt</td>
              <td>
                <Textarea
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      prompt: e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.prompt}
                />
              </td>
            </tr>
            <tr>
              <td>w</td>
              <td>
                <input
                  name="w"
                  type="number"
                  step="1"
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      w: +e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.w}
                />
                648
              </td>
            </tr>
            <tr>
              <td>h</td>
              <td>
                <input
                  name="h"
                  type="number"
                  step="1"
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      h: +e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.h}
                />
                1152
              </td>
            </tr>
            <tr>
              <td>num_steps</td>
              <td>
                <input
                  name="num_steps"
                  type="number"
                  step="1"
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      num_steps: +e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.num_steps}
                />
              </td>
            </tr>
            <tr>
              <td>guidance_scale</td>
              <td>
                <input
                  name="guidance_scale"
                  type="number"
                  step="0.1"
                  onChange={(e) =>
                    setKandinskyTxt2ImgParamsAndSave({
                      ...kandinskyTxt2ImgParams,
                      guidance_scale: +e.target.value,
                    })
                  }
                  value={kandinskyTxt2ImgParams.guidance_scale}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        {img ? (
          <img src={"http://localhost:5000/img/" + img} alt={"dasdas"} />
        ) : null}
      </div>
    </div>
  );
}
