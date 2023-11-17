import { makeAutoObservable } from "mobx";
import { localstorageClassSaver } from "@/src/utils/localsorage-class-saver";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { getSpeechSynthesis } from "@/src/utils/api/get-speech-synthesis";
import { getAudioDuration } from "@/src/utils/get-audio-duration";
import { getGptShorterText } from "@/src/utils/api/get-gpt-shorter-text";
import { getGptYoutubeVideoDescription } from "@/src/utils/api/get-gpt-youtube-video-description";
import { getGptYoutubeVideoKeywords } from "@/src/utils/api/get-gpt-youtube-video-keywords";
import { getFileSrcByPath } from "@/src/utils/get-file-src-by-path";

export class YoutubeLoaderStore {
  public prompt: string = "";
  public scientistAnswer: string = "";
  public scientistAnswerDescription: string = "";
  public audioSrc: string = "";
  public audioFilePath: string = "";
  public audioDurationMs: number = 0;
  public videoFilePath: string = "";
  public youtubeDescription: string = "";
  public youtubeKeywords: string = "";

  get videoSrc(): string {
    return (this.videoFilePath && getFileSrcByPath(this.videoFilePath)) || "";
  }

  get youtubeTitle(): string {
    return this.prompt;
  }

  get youtubeTags(): string[] {
    return this.youtubeKeywords.split(",");
  }

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    makeAutoObservable(this);
    localstorageClassSaver(this, "YoutubeLoaderStore", [
      "prompt",
      "scientistAnswer",
      "scientistAnswerDescription",
      "audioSrc",
      "audioFilePath",
      "videoFilePath",
      "audioDurationMs",
      "youtubeKeywords",
      "youtubeDescription",
    ]);
  }

  clearAllData(): void {
    this.prompt = "";
    this.scientistAnswer = "";
    this.scientistAnswerDescription = "";
    this.audioSrc = "";
    this.audioFilePath = "";
    this.audioDurationMs = 0;
    this.videoFilePath = "";
    this.youtubeDescription = "";
    this.youtubeKeywords = "";
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  setScientistAnswer(scientistAnswer: string): void {
    this.scientistAnswer = scientistAnswer;
  }

  setVideoFilePath(videFilePath: string): void {
    this.videoFilePath = videFilePath;
  }

  async remakeSeo(): Promise<void> {
    console.log("Getting youtube description...");
    const gptDescription = await getGptYoutubeVideoDescription(
      this.prompt,
      this.scientistAnswer
    );
    this.youtubeDescription = gptDescription;
    console.log("Got " + this.youtubeDescription);

    console.log("Getting youtube keywords...");
    const keywords = await getGptYoutubeVideoKeywords(
      this.prompt,
      this.scientistAnswer
    );
    this.youtubeKeywords = keywords;
    console.log("Got " + keywords);
  }
  async regenerateAudioSrc(): Promise<void> {
    console.log(
      `Getting audio for scientist answer: ${this.scientistAnswer} ...`
    );
    this.audioFilePath = await getSpeechSynthesis(this.scientistAnswer);
    this.audioSrc = getFileSrcByPath(this.audioFilePath);

    console.log(`Audio duration is ...`);
    this.audioDurationMs = (await getAudioDuration(this.audioSrc)) * 1000;
    console.log(this.audioDurationMs);
  }

  async regenerateScientistAnswer(): Promise<void> {
    console.log(`Getting AI answer (${this.prompt})...`);
    this.setScientistAnswer(await getGptScientistAnswer(this.prompt));
    console.log(`Scientist answer is: ${this.scientistAnswer}`);
  }

  async regenerateScientistAnswerDescription(): Promise<void> {
    console.log(`Getting AI answer shorter (${this.scientistAnswer})...`);
    this.scientistAnswerDescription = await getGptShorterText(
      this.scientistAnswer
    );
    console.log(`Scientist answer is: ${this.scientistAnswerDescription}`);
  }
}

export const youtubeLoaderStore = new YoutubeLoaderStore();
