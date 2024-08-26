import Disc from '@/components/disc';
import Sampler from '@/components/sampler';
import Controls from '@/components/controls';

const disc = new Disc(document.querySelector('#disc'));
const sampler = new Sampler();

const controls = new Controls({
  toggleButton: document.querySelector('#playToggle') as HTMLButtonElement,
  rewindButton: document.querySelector('#rewind') as HTMLButtonElement,
});

const start = async () => {
  await sampler.loadTrack(
    'https://www.pimskie.dev/public/assets/sounds/samples.mp3',
  );

  controls.isDisabled = false;

  disc.duration = sampler.duration;

  disc.callbacks.onStop = () => sampler.pause();
  disc.callbacks.onDragEnded = () => {
    if (!controls.isPlaying) {
      return;
    }
    sampler.play(disc.secondsPlayed);
  };

  disc.callbacks.onLoop = ({
    playbackSpeed,
    isReversed,
    secondsPlayed,
    progress,
  }) => {
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

  controls.callbacks.onToggleMuted = (isMuted) => {
    sampler.toggleMute(isMuted);
  };
};

start();
