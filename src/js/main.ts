import Disc from '@/components/disc';
import Sampler from '@/components/sampler';
import Controls from '@/components/controls';

const disc = new Disc(document.querySelector('#disc')!);
const sampler = new Sampler();

const controls = new Controls({
  toggleButton: document.querySelector('#playToggle') as HTMLButtonElement,
  rewindButton: document.querySelector('#rewind') as HTMLButtonElement,
});

await sampler.loadTrack('/scratch/audio/alphabet.mp3');

controls.isDisabled = false;

disc.setDuration(sampler.duration);

disc.callbacks.onStop = () => sampler.pause();

disc.callbacks.onDragEnded = () => {
  if (!controls.isPlaying) {
    return;
  }

  sampler.play(disc.secondsPlayed);
};

disc.callbacks.onLoop = ({ playbackSpeed, isReversed, secondsPlayed }) => {
  sampler.updateSpeed(playbackSpeed, isReversed, secondsPlayed);
};

controls.callbacks.onIsplayingChanged = (isPlaying) => {
  if (isPlaying) {
    disc.powerOn();
    sampler.play(disc.secondsPlayed);
  } else {
    disc.powerOff();
  }
};

controls.callbacks.onRewind = () => {
  disc.rewind();
};
