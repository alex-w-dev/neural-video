import { request } from "undici";
import { v4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";
import { AUDIO_FOLDER } from "@/src/constants/paths";
import { SynthesisVoiceEnum } from "@/src/constants/synthesis-voice.enum";
const Lame = require("node-lame").Lame;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

class Speech {
  private accessToken = "";
  private expiresAt = Date.now();
  private readonly rqUID = v4();
  private _authRequest: Promise<void> | null = null;

  constructor() {
    console.log("this.rqUID", this.rqUID);
  }

  async auth(): Promise<void> {
    if (!this._authRequest || this.expiresAt - Date.now() < 5000) {
      this._authRequest = new Promise(async (resolve, reject) => {
        console.log(
          process.env.SBER_SALUTE_SPEECH_TOKEN,
          "process.env.SBER_SALUTE_SPEECH_TOKEN"
        );
        try {
          const { statusCode, headers, body } = await request(
            "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${process.env.SBER_SALUTE_SPEECH_TOKEN}`,
                RqUID: this.rqUID,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                scope: "SALUTE_SPEECH_PERS",
              }).toString(),
            }
          );

          console.log(
            statusCode,
            headers,
            "statusCode, headers, trailers, body"
          );
          const bodyJson = (await body.json()) as {
            access_token: string;
            expires_at: number;
          };

          this.accessToken = bodyJson.access_token;
          this.expiresAt = bodyJson.expires_at;

          console.log(this.expiresAt, "this.expiresAt");
          console.log(Date.now(), "Date.now()");

          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }

    return this._authRequest;
  }

  async synthesis(
    prompt: string,
    voice: SynthesisVoiceEnum = SynthesisVoiceEnum.Alexandra
  ): Promise<string> {
    if (!prompt) {
      throw new Error("prompt is required");
    }

    if (prompt.length > 4000) {
      throw new Error("Too mach symbols in prompt");
    }

    await this.auth();

    const { body } = await request(
      `https://smartspeech.sber.ru/rest/v1/text:synthesize?format=wav16&voice=${voice}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/ssml",
        },
        body: prompt,
      }
    );
    const arrayBuffer = await body.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mp3FilePath = path.join(AUDIO_FOLDER, `${v4()}.mp3`);

    await new Promise<void>((resolve, reject) => {
      const encoder = new Lame({
        output: mp3FilePath,
        bitrate: 192,
      }).setBuffer(buffer);

      encoder
        .encode()
        .then(() => {
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });

    return mp3FilePath.replaceAll(path.sep, "/");
  }
}

export const speech = new Speech();

type ResponseData = {
  filePath: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const filePath = await speech.synthesis(req.body.prompt, req.body.voice);

  res.status(200).json({ filePath });
}
