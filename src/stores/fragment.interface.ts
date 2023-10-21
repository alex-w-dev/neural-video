import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";

export type Fragment = {
  prompt?: string;
  fragment: string;
  sentence: string;
  image?: KandinskyImage;
};
