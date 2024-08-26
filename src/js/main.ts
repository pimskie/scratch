import Record from '@/components/record';
import Sampler from '@/components/sampler';
import Controls from '@/components/controls';

const record = new Record(document.querySelector('#disc')!);
const sampler = new Sampler();

const controls = new Controls({
  toggleButton: document.querySelector('#playToggle') as HTMLButtonElement,
  rewindButton: document.querySelector('#rewind') as HTMLButtonElement,
});

await sampler.loadTrack('/scratch/audio/alphabet.mp3');

controls.isDisabled = false;

record.setDuration(sampler.duration);

record.callbacks.onStop = () => sampler.pause();

record.callbacks.onDragEnded = () => {
  if (!controls.isPlaying) {
    return;
  }

  sampler.play(record.secondsPlayed);
};

record.callbacks.onLoop = (recordUpdate) => {
  sampler.updateSpeed(recordUpdate);
};

controls.callbacks.onIsplayingChanged = (isPlaying) => {
  if (isPlaying) {
    record.powerOn();
    sampler.play(record.secondsPlayed);
  } else {
    record.powerOff();
  }
};

controls.callbacks.onRewind = () => {
  record.rewind();
};
