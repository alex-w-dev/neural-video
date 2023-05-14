export class KandinskyTxt2ImgParams {
  constructor(defaults?: KandinskyTxt2ImgParams) {
    if (defaults) {
      Object.assign(this, defaults);
    }
  }
  prompt: string = "";
  prompt_ru: string = "";
  num_steps: number = 30;
  guidance_scale: number = 7;
  h: number = 1152;
  w: number = 648;
}
