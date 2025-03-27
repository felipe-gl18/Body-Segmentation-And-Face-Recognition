Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  const labeledFaceDescriptiors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptiors, 0.6);
  const image = document.getElementById("faces");
  const canvas = document.getElementById("facesCanvas");
  const displaySize = { width: image.width, height: image.height };
  faceapi.matchDimensions(canvas, displaySize);
  const detections = await faceapi
    .detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const results = resizedDetections.map((d) =>
    faceMatcher.findBestMatch(d.descriptor)
  );
  results.forEach(({ result, i }) => {
    const box = resizedDetections[i].detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
    drawBox.draw(canvas);
  });
}

async function loadLabeledImages() {
  const faces = await fetch("../faces.json");
  const people = await faces.json();
  const labels = Object.keys(people);
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      people[label].map(async (url) => {
        const img = await faceapi.fetchImage(url);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      });

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
