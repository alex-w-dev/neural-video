import { makeAutoObservable } from "mobx";
import { localstorageClassSaver } from "@/src/utils/localsorage-class-saver";
import { getGptSeparatedTextPrompt } from "@/src/utils/api/get-gpt-separated-text-prompt";
import { getKandinskyMobileImage } from "@/src/utils/api/get-kandinsky-mobile-image";
import { consoleImage } from "@/src/utils/console-image";
import { getGptScientistAnswer } from "@/src/utils/api/get-gpt-scientist-answer";
import { splitTextToSentences } from "@/src/utils/split-text-to-sentences";
import { getSpeechSynthesis } from "@/src/utils/api/get-speech-synthesis";
import { getAudioDuration } from "@/src/utils/get-audio-duration";
import { VideRecorderImage } from "@/src/components/video-recorder";
import { getGptShorterText } from "@/src/utils/api/get-gpt-shorter-text";
import { getGptYoutubeVideoDescription } from "@/src/utils/api/get-gpt-youtube-video-description";
import { getGptYoutubeVideoKeywords } from "@/src/utils/api/get-gpt-youtube-video-keywords";
import { Fragment } from "@/src/stores/fragment.interface";
import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { getKandinskyMobileImageTransformation } from "@/src/utils/api/get-kandinsky-mobile-image-transformation";
import { FragmentTransition } from "@/src/stores/fragment-transition.interface";
import { getKandinskyMobileMixedImages } from "@/src/utils/api/get-kandinsky-mobile-mixed-images";
import { VideoMode } from "@/src/stores/video-mode.enum";
import { FilmAnimation } from "@/src/film/animations/film-animation";
import { ScientistAnswerAlphaAnimation } from "@/src/film/animations/scientist-answer-alpha.animation";
import { ScientistAnswerEvolutionAnimation } from "@/src/film/animations/scientist-answer-evolution.animation";
import { ChannelEnum } from "@/src/stores/channel.enum";

export class CurrentVideoStore {
  public channel: ChannelEnum = ChannelEnum.neuralAcked;
  public videoMode: VideoMode = VideoMode.scientistAlpha;
  public get filmAnimationClass(): typeof FilmAnimation {
    if (this.videoMode === VideoMode.scientistAlpha) {
      return ScientistAnswerAlphaAnimation;
    } else {
      return ScientistAnswerEvolutionAnimation;
    }
  }
  public prompt: string = "";
  public scientistAnswer: string = "";
  public scientistAnswerDescription: string = "";
  public fragments: Array<Fragment> = [];
  public fragmentTransitions: Array<FragmentTransition> = [];
  public audioSrc: string = "";
  public audioFilePath: string = "";
  public audioDurationMs: number = 0;
  public videFilePath: string = "";
  public youtubeDescription: string = "";
  public youtubeKeywords: string = "";

  get allFragmentsHasPrompts(): boolean {
    return this.fragments.every((f) => !!f.prompt);
  }

  get videRecorderImages(): VideRecorderImage[] {
    return this.fragments
      .filter((fragment) => !!fragment.image)
      .map((fragment, index) => {
        return {
          image: fragment.image!,
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
    return this.channel === ChannelEnum.jesusIsPath
      ? this.prompt
      : `Нейросеть спросили: ${this.prompt}?`;
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
      "fragmentTransitions",
      "channel",
      "videoMode",
    ]);
  }

  clearAllData(): void {
    this.prompt = "";
    this.scientistAnswer = "";
    this.scientistAnswerDescription = "";
    this.fragments = [];
    this.fragmentTransitions = [];
    this.audioSrc = "";
    this.audioFilePath = "";
    this.audioDurationMs = 0;
    this.videFilePath = "";
    this.youtubeDescription = "";
    this.youtubeKeywords = "";
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  setVideMode(videMode: VideoMode): void {
    this.videoMode = videMode;
  }

  setChanel(channel: ChannelEnum): void {
    this.channel = channel;
  }

  setFragments(fragments: Fragment[]): void {
    this.fragments = fragments;
  }

  setFragmentTransitions(transitions: FragmentTransition[]): void {
    this.fragmentTransitions = transitions;
  }

  setFragmentPrompt(fragment: Fragment, prompt: string): void {
    fragment.prompt = prompt;
    this.setFragments([...this.fragments]);
  }
  setFragmentImage(fragment: Fragment, image: KandinskyImage): void {
    fragment.image = image;

    fragment.transitPreImages = [image, image, image, image];
    fragment.transitPostImages = [image, image, image, image];

    this.setFragments([...this.fragments]);
  }
  setFragmentTransformPreImages(
    fragment: Fragment,
    images: KandinskyImage[]
  ): void {
    fragment.transitPreImages = images;
    this.setFragments([...this.fragments]);
  }

  setFragmentTransformPostImages(
    fragment: Fragment,
    images: KandinskyImage[]
  ): void {
    fragment.transitPostImages = images;
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
    this.youtubeDescription =
      this.channel === ChannelEnum.jesusIsPath
        ? gptDescription
        : `${gptDescription}\nВы также можете задавать свои вопросы в комментариях! - там подключена нейросеть!!!`;
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
      45
    );
    currentVideoStore.initFragments(separatedText);
    console.log("Separated text is: ", separatedText);
  }

  initFragments(fragmentTexts: { fragment: string; sentence: string }[]): void {
    this.fragments = fragmentTexts.map((fragment) => ({
      ...fragment,
    }));
  }

  async regenerateFrameImgSrc(fragment: Fragment): Promise<void> {
    console.log(`Getting image for prompt: ${fragment.prompt} ...`);
    const image = await getKandinskyMobileImage(
      fragment.prompt + ", высокое качетство, 4k"
    );
    this.setFragmentImage(fragment, image);
    console.log(`Got ${image.src}:`);
    await consoleImage(image.src, 100);
  }

  getNextFragment(fragment: Fragment): Fragment {
    return (
      this.fragments[this.fragments.indexOf(fragment) + 1] || this.fragments[0]
    );
  }
  getPreviousFragment(fragment: Fragment): Fragment {
    return (
      this.fragments[this.fragments.indexOf(fragment) - 1] ||
      this.fragments[this.fragments.length - 1]
    );
  }

  async regenerateFrameTransitImages(fragment: Fragment): Promise<void> {
    if (!fragment.image) {
      return alert(`no image for fragment ${fragment.fragment}`);
    }
    if (this.videoMode === VideoMode.scientistEvolution) {
      const nextFrame = this.getNextFragment(fragment);
      console.log(
        `Getting image from prompt${fragment.prompt} to ${nextFrame.prompt} ...`
      );
      const postImages = await getKandinskyMobileImageTransformation(
        fragment.image.fileName,
        nextFrame.prompt + ", высокое качетство, 4k",
        11
      );

      if (this.fragments.indexOf(nextFrame) !== 0 && postImages.length) {
        this.setFragmentImage(nextFrame, postImages.pop()!);
      }

      this.setFragmentTransformPostImages(fragment, postImages);
      console.log(`Got ${postImages.length} images`);
    }
    if (this.videoMode === VideoMode.scientistAlpha) {
      {
        const nextFrame = this.getNextFragment(fragment);
        console.log(
          `Getting image from prompt${fragment.prompt} to ${nextFrame.prompt} ...`
        );
        const postImages = await getKandinskyMobileImageTransformation(
          fragment.image.fileName,
          nextFrame.prompt + ", высокое качетство, 4k"
        );
      }
      {
        const preFrame = this.getPreviousFragment(fragment);
        console.log(
          `Getting image from prompt${fragment.prompt} to ${preFrame.prompt} ...`
        );
        const preImages = await getKandinskyMobileImageTransformation(
          fragment.image.fileName,
          preFrame.prompt + ", высокое качетство, 4k"
        );
        this.setFragmentTransformPreImages(fragment, preImages.reverse());
        console.log(`Got ${preImages.length} images`);
      }
    }
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
      `${this.prompt}, ${fragment.sentence}`,
      fragment.fragment
    );
    this.setFragmentPrompt(fragment, prompt);
  }

  clearFragmentImages(): void {
    console.log("Getting  prompts and images to text fragments");
    for (const fragment of this.fragments) {
      fragment.prompt = undefined;
      fragment.image = undefined;
      fragment.transitPreImages = undefined;
      fragment.transitPostImages = undefined;
    }
    this.fragments = [...this.fragments];
  }

  async regenerateFramesPromptsAndImages(): Promise<void> {
    console.log("Getting  prompts and images to text fragments");
    for (const fragment of this.fragments) {
      await this.regenerateFramePrompt(fragment);
      await this.regenerateFrameImgSrc(fragment);
    }
  }

  getFramesTransitionMiddle(
    preFragment: Fragment,
    postFragment: Fragment
  ): FragmentTransition | undefined {
    return this.fragmentTransitions.find(
      (ft) => ft.preFragment === preFragment && ft.postFragment === postFragment
    );
  }

  async regenerateFragmentMiddleTransition(
    preFragment: Fragment,
    postFragment: Fragment
  ): Promise<void> {
    if (!preFragment.image || !postFragment.image) {
      return alert("no images in mixable fragments");
    }
    {
      // remove existing
      const existing = this.getFramesTransitionMiddle(
        preFragment,
        postFragment
      );
      if (existing) {
        this.setFragmentTransitions(
          this.fragmentTransitions.filter((ft) => ft !== existing)
        );
      }
    }

    console.log(
      `getting images between "${preFragment.prompt}" and  "${postFragment.prompt}"`
    );
    const images = await getKandinskyMobileMixedImages(
      preFragment.image.fileName,
      postFragment.image.fileName
    );

    this.setFragmentTransitions([
      ...this.fragmentTransitions,
      {
        postFragment,
        preFragment,
        images,
      },
    ]);
  }

  async regenerateFragmentMiddleTransitions(): Promise<void> {
    console.log("Regenerate fragment transitions");
    for (const fragment of this.fragments) {
      const postFrame = this.getNextFragment(fragment);
      await this.regenerateFragmentMiddleTransition(fragment, postFrame);
    }
  }

  async regenerateFramesImagesTransition(): Promise<void> {
    console.log("Getting  prompts and images to text fragments");
    for (const fragment of this.fragments) {
      await this.regenerateFrameTransitImages(fragment);
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
