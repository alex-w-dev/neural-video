import { KandinskyImage } from "@/src/dto/kandinsky-image.interface";
import { Fragment } from "@/src/stores/fragment.interface";

export type FragmentTransition = {
  preFragment: Fragment;
  postFragment: Fragment;
  images: KandinskyImage[];
};
