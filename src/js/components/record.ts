const TAU = Math.PI * 2;

import {
  getElementCenter,
  clamp,
  angleBetween,
  angleDifference,
} from '@/utils/utils';
import * as arrayUtils from '@/utils/array';

import { RPS, RADIANS_PER_MILLISECOND } from '@/config/rotationSpeed';

import type { RecordUpdate } from '@/types/RecordUpdate';
import type { Vector } from '@/types/Vector';

class Disc {
  public el: HTMLDivElement;

  private _playbackSpeed = 1;
  private _duration = 0;
  private _isDragging = false;

  private _center: Vector;

  private _currentAngle = 0;
  private _previousAngle = 0;
  private _maxAngle = TAU;

  public rafId: number | null = null;

  private _previousTimestamp: number;

  private _draggingSpeeds: Array<number> = [];
  private _draggingFrom: Vector = { x: 0, y: 0 };

  public isReversed: boolean = false;

  public callbacks = {
    // @ts-expect-error: unused var
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDragEnded: (secondsPlayed: number): void => {},
    onStop: () => {},

    // @ts-expect-error: unused var
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLoop: (params: RecordUpdate) => {},
  };

  constructor(el: HTMLDivElement) {
    this.el = el;

    this._center = getElementCenter(this.el);

    this._previousTimestamp = performance.now();

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragProgress = this.onDragProgress.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.el.addEventListener('pointerdown', this.onDragStart);
  }

  get playbackSpeed() {
    return this._playbackSpeed;
  }

  set playbackSpeed(s) {
    this._draggingSpeeds.push(s);
    this._draggingSpeeds = arrayUtils.limit(this._draggingSpeeds, 10);

    this._playbackSpeed = arrayUtils.average(this._draggingSpeeds);
    this._playbackSpeed = clamp(this._playbackSpeed, -4, 4);
  }

  get secondsPlayed() {
    return this._currentAngle / TAU / RPS;
  }

  get isDragging() {
    return this._isDragging;
  }

  set isDragging(d) {
    this._isDragging = d;
    this.el.classList.toggle('is-scratching', d);
  }

  powerOn() {
    this._playbackSpeed = 1;

    this.start();
  }

  powerOff() {
    this.stop();
  }

  public setDuration(duration: number) {
    this._duration = duration;
    this._maxAngle = duration * RPS * TAU;
  }

  onDragStart(e: PointerEvent) {
    document.body.addEventListener('pointermove', this.onDragProgress);
    document.body.addEventListener('pointerup', this.onDragEnd);

    this._center = getElementCenter(this.el);
    this._draggingFrom = {
      x: e.clientX,
      y: e.clientY,
    };

    this.isDragging = true;
  }

  onDragProgress(e: MouseEvent) {
    const pointerPosition: Vector = {
      x: e.clientX,
      y: e.clientY,
    };

    const anglePointerToCenter = angleBetween(this._center, pointerPosition);

    const angle_DraggingFromToCenter = angleBetween(
      this._center,
      this._draggingFrom,
    );

    const angleDragged = angleDifference(
      angle_DraggingFromToCenter,
      anglePointerToCenter,
    );

    this.setAngle(this._currentAngle - angleDragged);

    this._draggingFrom = { ...pointerPosition };
  }

  onDragEnd() {
    document.body.removeEventListener('pointermove', this.onDragProgress);
    document.body.removeEventListener('pointerup', this.onDragEnd);

    this.isDragging = false;
    this.playbackSpeed = 1;

    this.callbacks.onDragEnded(this.secondsPlayed);
  }

  autoRotate(timestampDifference: number) {
    const rotationSpeed = RADIANS_PER_MILLISECOND * timestampDifference;

    this.setAngle(this._currentAngle + rotationSpeed);
  }

  setAngle(angle: number) {
    this._currentAngle = clamp(angle, 0, this._maxAngle);

    return this._currentAngle;
  }

  start() {
    this._previousTimestamp = performance.now();

    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.rafId || 0);

    this.callbacks.onStop();
  }

  rewind() {
    this.setAngle(0);
  }

  loop() {
    const currentTimestamp = performance.now();
    const timestampDifferenceMS = currentTimestamp - this._previousTimestamp;

    if (!this.isDragging) {
      this.autoRotate(timestampDifferenceMS);
    }

    const rotated = this._currentAngle - this._previousAngle;
    const rotationNormal = RADIANS_PER_MILLISECOND * timestampDifferenceMS;

    this.playbackSpeed = rotated / rotationNormal || 0;
    this.isReversed = this.playbackSpeed < 0;

    this._previousAngle = this._currentAngle;
    this._previousTimestamp = performance.now();

    this.el.style.transform = `rotate(${this._currentAngle}rad)`;

    const { playbackSpeed, isReversed, secondsPlayed } = this;

    this.callbacks.onLoop({
      playbackSpeed,
      isReversed,
      secondsPlayed,
    });

    this._previousAngle = this._currentAngle;

    this.rafId = requestAnimationFrame(this.loop);
  }
}

export default Disc;