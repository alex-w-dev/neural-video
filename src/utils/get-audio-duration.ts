export function getAudioDuration(audioSrc: string): Promise<number> {
  const audio: HTMLAudioElement = document.createElement("audio");

  return new Promise((resolve, reject) => {
    audio.src = audioSrc;
    audio.onloadedmetadata = function () {
      resolve(audio.duration);
    };
  });
}
