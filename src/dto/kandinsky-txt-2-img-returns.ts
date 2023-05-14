export class KandinskyTxt2ImgReturns{

  constructor(defaults?: KandinskyTxt2ImgReturns) {
    if (defaults) {
      Object.assign(this, defaults);
    }
  }

  file_path: string = '';
  file_name: string = '';
}