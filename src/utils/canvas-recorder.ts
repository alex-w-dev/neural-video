export function getCanvasRecorder({
  canvas,
  audioSrc,
}: {
  canvas: HTMLCanvasElement;
  audioSrc: string;
}) {
  var cStream,
    aStream,
    audioElement: HTMLAudioElement,
    recorder,
    analyser,
    dataArray,
    bufferLength,
    chunks = [];

  let video: HTMLVideoElement;

  function startRecording() {
    if (!aStream) {
      initAudioStream();
    }

    cStream = canvas!.captureStream(30);
    cStream.addTrack(aStream.getAudioTracks()[0]);

    recorder = new MediaRecorder(cStream);
    recorder.start();

    recorder.ondataavailable = saveChunks;

    recorder.onstop = saveVideo;
  }

  function saveVideo() {
    if (chunks.length) {
      var blob = new Blob(chunks, { type: chunks[0].type });
      var vidURL = URL.createObjectURL(blob);
      video = document.createElement("video");
      video.controls = true;
      video.src = vidURL;
      video.onend = function () {
        URL.revokeObjectURL(vidURL);
      };
      console.log(1111111111);
    } else {
      throw new Error("no data");
    }
  }

  function saveChunks(e) {
    e.data.size && chunks.push(e.data);
  }

  function stopRecording(): Promise<void> {
    audioElement.pause();
    recorder.stop();

    return new Promise((res) => setTimeout(res, 100));
  }

  function initAudioStream() {
    var audioCtx = new AudioContext();
    // create a stream from our AudioContext
    var dest = audioCtx.createMediaStreamDestination();
    aStream = dest.stream;
    // connect our video element's output to the stream
    var sourceNode = audioCtx.createMediaElementSource(audioElement);
    sourceNode.connect(dest);
    // start the video
    audioElement.play();

    // just for the fancy canvas drawings
    analyser = audioCtx.createAnalyser();
    sourceNode.connect(analyser);

    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // output to our headphones
    sourceNode.connect(audioCtx.destination);
  }
  function enableButton() {
    audioElement.oncanplay = null;
  }

  var loadVideo = function () {
    audioElement = document.createElement("audio");
    audioElement.crossOrigin = "anonymous";
    audioElement.oncanplay = enableButton;
    audioElement.src = audioSrc;
  };

  loadVideo();

  return {
    stopRecording,
    exportStream: () => video,
    startRecording,
  };
}
