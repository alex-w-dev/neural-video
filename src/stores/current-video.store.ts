import { IObjectDidChange, makeAutoObservable, observe, toJS } from "mobx";
import { localstorageClassSaver } from "@/src/utils/localsorage-class-saver";

type Fragment = { prompt?: string; fragment: string; imgSrc?: string };

export class CurrentVideoStore {
  public prompt: string = "";
  public scientistAnswer: string = "";
  public fragments: Array<Fragment> = [];

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    makeAutoObservable(this);
    localstorageClassSaver(this, "CurrentVideoStore", [
      "prompt",
      "scientistAnswer",
      "fragments",
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
  }
  setFragmentImgSrc(fragment: Fragment, imgSrc: string): void {
    fragment.imgSrc = imgSrc;
  }

  setScientistAnswer(scientistAnswer: string): void {
    this.scientistAnswer = scientistAnswer;
  }

  initFragments(fragmentTexts: string[]): void {
    this.fragments = fragmentTexts.map((text) => ({
      fragment: text,
    }));
  }
}

export const currentVideoStore = new CurrentVideoStore();
