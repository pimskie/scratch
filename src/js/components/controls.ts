class Controls {
  public toggleButton: HTMLButtonElement;
  public rewindButton: HTMLButtonElement;

  public isPlaying: boolean = false;

  public callbacks = {
    // @ts-expect-error: unused var
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onIsplayingChanged: (isPlaying: boolean) => {},
    onRewind: () => {},
  };

  constructor({
    toggleButton,
    rewindButton,
  }: {
    toggleButton: HTMLButtonElement;
    rewindButton: HTMLButtonElement;
  }) {
    this.toggleButton = toggleButton;
    this.rewindButton = rewindButton;

    this.toggleButton.addEventListener('click', () => this.toggle());
    this.rewindButton.addEventListener('click', () => this.rewind());

    this.isDisabled = true;
  }

  set isDisabled(disabled: boolean) {
    this.toggleButton.disabled = disabled;
    this.rewindButton.disabled = disabled;
  }

  toggle() {
    this.isPlaying = !this.isPlaying;

    this.toggleButton.classList.toggle('is-active', this.isPlaying);

    this.callbacks.onIsplayingChanged(this.isPlaying);
  }

  rewind() {
    this.callbacks.onRewind();
  }
}

export default Controls;
