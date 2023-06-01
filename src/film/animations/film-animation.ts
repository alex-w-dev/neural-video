import { Application } from "pixi.js";

export class FilmAnimation {
  isPlaying = false;
  constructor(protected app: Application) {}

  play(): void {}
  stop(): void {
    this.isPlaying = false;
  }
  getTime(): number {
    return 100;
  }
  needImagesLength(): number {
    return 10;
  }
}
