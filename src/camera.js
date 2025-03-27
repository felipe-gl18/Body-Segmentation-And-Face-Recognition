export class Camera {
  constructor() {
    this.video = null;
  }

  async run() {
    if (this.video) return this.video;

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

    this.video = videoElement;
    return this.video;
  }
}
