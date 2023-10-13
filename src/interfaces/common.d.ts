export type Fragment = { prompt: string; fragment: string };
export type FragmentImage = Fragment & { src: string };

export type VideRecorderOnReadyData = {
  videoFilePath: string;
  videoSrc: string;
};
