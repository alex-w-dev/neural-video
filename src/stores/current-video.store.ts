import { IObjectDidChange, makeAutoObservable, observe, toJS } from "mobx";
import { localstorageClassSaver } from "@/src/utils/localsorage-class-saver";
import { getGptSeparatedTextPrompt } from "@/src/utils/api/get-gpt-separated-text-prompt";
import { getKandinskyMobileImage } from "@/src/utils/api/get-kandinsky-mobile-image";
import { consoleImage } from "@/src/utils/console-image";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { getGptSeparatedText } from "@/src/utils/api/get-gpt-separated-text";
import { splitTextToSentences } from "@/src/utils/split-text-to-sentences";
import { getSpeechSynthesis } from "@/src/utils/api/get-speech-synthesis";
import { getAudioDuration } from "@/src/utils/get-audio-duration";
import { VideRecorderImage } from "@/src/components/video-recorder";
import { getGptShorterText } from "@/src/utils/api/get-gpt-shorter-text";
import { getGptYoutubeVideoDescription } from "@/src/utils/api/get-gpt-youtube-video-description";
import { getGptYoutubeVideoKeywords } from "@/src/utils/api/get-gpt-youtube-video-keywords";

type Fragment = { prompt?: string; fragment: string; imgSrc?: string };

export class CurrentVideoStore {
  public prompt: string = "";
  public scientistAnswer: string = "";
  public scientistAnswerDescription: string = "";
  public fragments: Array<Fragment> = [];
  public audioSrc: string = "";
  public audioFilePath: string = "";
  public audioDurationMs: number = 0;
  public videFilePath: string = "";
  public youtubeDescription: string = "";
  public youtubeKeywords: string = "";

  get videRecorderImages(): VideRecorderImage[] {
    return this.fragments
      .filter((fragment) => !!fragment.imgSrc)
      .map((fragment, index) => {
        return {
          src: fragment.imgSrc!,
          id: index,
          title: fragment.fragment,
        };
      });
  }

  get videoSrc(): string {
    return (
      (this.videFilePath &&
        "http://localhost:3000/api/get-file?path=" + this.videFilePath) ||
      ""
    );
  }

  get youtubeTitle(): string {
    return `Нейросеть спросили: ${this.prompt}?`;
  }

  get youtubeTags(): string[] {
    return this.youtubeKeywords.split(",");
  }

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    makeAutoObservable(this);
    localstorageClassSaver(this, "CurrentVideoStore", [
      "prompt",
      "scientistAnswer",
      "scientistAnswerDescription",
      "fragments",
      "audioSrc",
      "audioFilePath",
      "videFilePath",
      "audioDurationMs",
      "youtubeKeywords",
      "youtubeDescription",
    ]);
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  setFragments(fragments: Fragment[]): void {
    this.fragments = fragments;
  }

  setFragmentPrompt(fragment: Fragment, prompt: string): void {
    fragment.prompt = prompt;
    this.setFragments([...this.fragments]);
  }
  setFragmentImgSrc(fragment: Fragment, imgSrc: string): void {
    fragment.imgSrc = imgSrc;
    this.setFragments([...this.fragments]);
  }

  setScientistAnswer(scientistAnswer: string): void {
    this.scientistAnswer = scientistAnswer;
  }

  setVideoFilePath(videFilePath: string): void {
    this.videFilePath = videFilePath;
  }

  async remakeSeo(): Promise<void> {
    console.log("Getting youtube description...");
    const gptDescription = await getGptYoutubeVideoDescription(
      this.prompt,
      this.scientistAnswer
    );
    this.youtubeDescription = `${gptDescription}\nВы также можете задавать свои вопросы в комментариях! - там подключена нейросеть!!!`;
    console.log("Got " + this.youtubeDescription);

    console.log("Getting youtube keywords...");
    const keywords = await getGptYoutubeVideoKeywords(
      this.prompt,
      this.scientistAnswer
    );
    this.youtubeKeywords = keywords;
    console.log("Got " + keywords);
  }

  async splitScientistAnswerToFrames(): Promise<void> {
    console.log("Getting separated text...");
    // const separatedText = await getGptSeparatedText(
    //   currentVideoStore.scientistAnswer
    // );
    const separatedText = splitTextToSentences(
      currentVideoStore.scientistAnswer,
      30
    );
    currentVideoStore.initFragments(separatedText);
    console.log("Separated text is: ", separatedText);
  }

  initFragments(fragmentTexts: string[]): void {
    this.fragments = fragmentTexts.map((text) => ({
      fragment: text,
    }));
  }

  async regenerateFrameImgSrc(fragment: Fragment): Promise<void> {
    console.log(`Getting image for prompt: ${fragment.prompt} ...`);
    const src = await getKandinskyMobileImage(
      fragment.prompt + ", высокое качетство, 4k"
    );
    this.setFragmentImgSrc(fragment, src);
    console.log(`Got ${src}:`);
    await consoleImage(src, 100);
  }

  async regenerateAudioSrc(): Promise<void> {
    console.log(
      `Getting audio for scientist answer: ${this.scientistAnswer} ...`
    );
    this.audioFilePath = await getSpeechSynthesis(this.scientistAnswer);
    this.audioSrc =
      "http://localhost:3000/api/get-file?path=" + this.audioFilePath;

    console.log(`Audio duration is ...`);
    this.audioDurationMs = (await getAudioDuration(this.audioSrc)) * 1000;
    console.log(this.audioDurationMs);
  }

  async regenerateFramePrompt(fragment: Fragment): Promise<void> {
    console.log(`Getting prompt for text: ${fragment.fragment}...`);
    const prompt = await getGptSeparatedTextPrompt(
      this.scientistAnswerDescription,
      fragment.fragment
    );
    this.setFragmentPrompt(fragment, prompt);
  }

  async regenerateFramesContents(): Promise<void> {
    console.log("Getting  prompts and images to text fragments");
    for (const fragment of this.fragments) {
      await this.regenerateFramePrompt(fragment);
      await this.regenerateFrameImgSrc(fragment);
    }
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

export const currentVideoStore = new CurrentVideoStore();
