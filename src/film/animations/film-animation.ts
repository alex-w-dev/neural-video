import { Film } from "@/src/film/film.class";

export class FilmAnimation {
  isPlaying = false;
  constructor(protected film: Film) {}

  async beforePlay(): Promise<void> {}

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
