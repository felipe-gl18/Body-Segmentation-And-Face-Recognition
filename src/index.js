import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
import "https://cdn.jsdelivr.net/npm/@tensorflow-models/body-segmentation@1.0.2/dist/body-segmentation.min.js";

const model = bodySegmentation.SupportedModels.BodyPix;
const segmenterConfig = {
  runtime: "tfjs",
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
  modelType: "general",
};

let video;
let segmenter;

async function setup() {
  video = await runVideo();
  segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
  requestAnimationFrame(runSegmentation);
}

async function runSegmentation() {
  if (!segmenter || !video) return;

  const segmentation = await segmenter.segmentPeople(video, {
    multiSegmentation: false,
    segmentBodyParts: true,
  });

  const coloredPartImage = await bodySegmentation.toColoredMask(
    segmentation,
    bodySegmentation.bodyPixMaskValueToRainbowColor,
    { r: 255, g: 255, b: 255, a: 255 }
  );

  const canvas = document.getElementById("canvas");
  if (canvas) {
    bodySegmentation.drawPixelatedMask(
      canvas,
      video,
      coloredPartImage,
      0.7, // opacity
      0, // maskBlurAmount
      false, // flipHorizontal
      10.0 // pixelCellWidth
    );
  }
  requestAnimationFrame(runSegmentation);
}

async function runVideo() {
  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.height = 500;
  videoElement.width = 500;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  videoElement.srcObject = stream;
  await new Promise((resolve) => (videoElement.onloadedmetadata = resolve));

  return videoElement;
}

setup();
