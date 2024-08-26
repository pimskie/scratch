class Sampler {
  public audioContext: AudioContext = new AudioContext();
  public gainNode: GainNode = new GainNode(this.audioContext);

  public audioBuffer: AudioBuffer | null = null;
  public audioBufferReversed: AudioBuffer | null = null;
  public audioSource: AudioBufferSourceNode | null = null;

  public duration: number = 0;
  public isReversed: boolean = false;

  constructor() {
    this.gainNode.connect(this.audioContext.destination);
  }

  async getAudioBuffer(audioUrl: string) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  }

  async loadTrack(audioUrl: string) {
    this.audioBuffer = await this.getAudioBuffer(audioUrl);
    this.audioBufferReversed = this.getReversedAudioBuffer(this.audioBuffer);

    this.duration = this.audioBuffer.duration;
  }

  getReversedAudioBuffer(audioBuffer: AudioBuffer) {
    const bufferArray = audioBuffer.getChannelData(0).slice().reverse();

    const audioBufferReversed = this.audioContext.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate,
    );

    audioBufferReversed.getChannelData(0).set(bufferArray);

    return audioBufferReversed;
  }

  changeDirection(isReversed: boolean, secondsPlayed: number) {
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

  updateSpeed(speed: number, isReversed: boolean, secondsPlayed: number) {
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

  pause() {
    if (!this.audioSource) {
      return;
    }

    this.audioSource.stop();
  }
}

export default Sampler;
