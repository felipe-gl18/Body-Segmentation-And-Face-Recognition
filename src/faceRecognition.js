import { Camera } from "./camera.js";
import { RoomInfo } from "./roomInfo.js";

let cachedLbaeledFaceDescriptors = null;

function setup() {
  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  ]).then(start);
}

async function start() {
  const labeledFaceDescriptiors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptiors, 0.6);
  const video = await new Camera().run();
  const canvas = document.getElementById("facesCanvas");
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  async function detectFaces() {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });

    new RoomInfo().addDectectedPeople(results);

    setTimeout(detectFaces, 100);
  }

  detectFaces();
}

async function loadLabeledImages() {
  if (cachedLbaeledFaceDescriptors) return cachedLbaeledFaceDescriptors;

  const labels = ["Felipe Gadelha Lino", "Tiago Gadelha Lino"];
  const descriptors = await Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/felipe-gl18/Body-Segmentation-And-Face-Recognition/main/faces/${label}%20${i}.JPG`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );

  cachedLbaeledFaceDescriptors = descriptors;
  return descriptors;
}

setup();
