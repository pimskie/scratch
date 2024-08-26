class Sampler {
  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();

    this.audioBuffer = null;
    this.audioBufferReversed = null;
    this.audioSource = null;

    this.duration = 0;
    this.speedPrevious = 0;
    this.isReversed = false;

    this.gainNode.connect(this.audioContext.destination);
  }

  async getArrayBufferFromUrl(audioUrl) {
    const response = await fetch(audioUrl);
    const buffer = await response.arrayBuffer();

    return buffer;
  }

  async getAudioBuffer(audioUrl) {
    const arrayBuffer = await this.getArrayBufferFromUrl(audioUrl);
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  }

  async loadTrack(audioUrl) {
    this.audioBuffer = await this.getAudioBuffer(audioUrl);
    this.audioBufferReversed = this.getReversedAudioBuffer(this.audioBuffer);

    this.duration = this.audioBuffer.duration;
  }

  getReversedAudioBuffer(audioBuffer) {
    const bufferArray = audioBuffer.getChannelData(0).slice().reverse();

    const audioBufferReversed = this.audioContext.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate,
    );

    audioBufferReversed.getChannelData(0).set(bufferArray);

    return audioBufferReversed;
  }

  changeDirection(isReversed, secondsPlayed) {
    this.isReversed = isReversed;
    this.play(secondsPlayed);
  }

  play(offset = 0) {
    this.pause();

    const buffer = this.isReversed
      ? this.audioBufferReversed
      : this.audioBuffer;

    const cueTime = this.isReversed ? this.duration - offset : offset;

    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = buffer;
    this.audioSource.loop = false;

    this.audioSource.connect(this.gainNode);

    this.audioSource.start(0, cueTime);
  }

  updateSpeed(speed, isReversed, secondsPlayed) {
    if (!this.audioSource) {
      return;
    }

    if (isReversed !== this.isReversed) {
      this.changeDirection(isReversed, secondsPlayed);
    }

    const { currentTime } = this.audioContext;
    const speedAbsolute = Math.abs(speed);

    this.audioSource.playbackRate.cancelScheduledValues(currentTime);
    this.audioSource.playbackRate.linearRampToValueAtTime(
      Math.max(0.001, speedAbsolute),
      currentTime,
    );
  }

  toggleMute(isMuted) {
    this.gainNode.gain.value = isMuted ? 0 : 1;
  }

  pause() {
    if (!this.audioSource) {
      return;
    }

    this.audioSource.stop();
  }
}

export default Sampler;
