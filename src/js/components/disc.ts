const TAU = Math.PI * 2;

import {
  getElementCenter,
  clamp,
  angleBetween,
  angleDifference,
} from '../utils/utils.js';
import * as arrayUtils from '../utils/array.js';

import { RPS, RADIANS_PER_MILLISECOND } from '../config/rotationSpeed.js';

const noop = () => {};
class Disc {
  constructor(el) {
    this.el = el;

    this._isPoweredOn = false;
    this._playbackSpeed = 1;
    this._duration = 0;
    this._isDragging = false;

    this.center = getElementCenter(this.el);

    this.angle = 0;
    this.anglePrevious = 0;
    this.maxAngle = TAU;

    this.rafId = null;

    this.timestampPrevious = performance.now();

    this.draggingSpeeds = [];
    this.draggingFrom = {};
    this.isReversed = false;

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragProgress = this.onDragProgress.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.loop = this.loop.bind(this);

    this.callbacks = {
      onDragEnded: noop,
      onAutoRotate: noop,
      onStop: noop,
      onLoop: noop,
    };

    this.init();
  }

  init() {
    this.el.addEventListener('pointerdown', this.onDragStart);
  }

  get playbackSpeed() {
    return this._playbackSpeed;
  }

  set playbackSpeed(s) {
    this.draggingSpeeds.push(s);
    this.draggingSpeeds = arrayUtils.limit(this.draggingSpeeds, 10);

    this._playbackSpeed = arrayUtils.smooth(this.draggingSpeeds);
    this._playbackSpeed = arrayUtils.average(this.draggingSpeeds);
    this._playbackSpeed = clamp(this._playbackSpeed, -4, 4);
  }

  get secondsPlayed() {
    return this.angle / TAU / RPS;
  }

  get duration() {
    return this._duration;
  }

  set duration(durationInSeconds) {
    this._duration = durationInSeconds;
    this.maxAngle = durationInSeconds * RPS * TAU;
  }

  set isDragging(d) {
    this._isDragging = d;
    this.el.classList.toggle('is-scratching', d);
  }

  get isDragging() {
    return this._isDragging;
  }

  powerOn() {
    this._isPoweredOn = true;
    this._playbackSpeed = 1;

    this.start();
  }

  powerOff() {
    this._isPoweredOn = false;
    this.stop();
  }

  onDragStart(e) {
    document.body.addEventListener('pointermove', this.onDragProgress);
    document.body.addEventListener('pointerup', this.onDragEnd);

    this.center = getElementCenter(this.el);
    this.draggingFrom = {
      x: e.clientX,
      y: e.clientY,
    };

    this.isDragging = true;
  }

  onDragProgress(e) {
    e.preventDefault();

    const { clientX, clientY } = e;
    const pointerPosition = { x: clientX, y: clientY };

    const anglePointerToCenter = angleBetween(this.center, pointerPosition);
    const angleDraggingFromToCenter = angleBetween(
      this.center,
      this.draggingFrom,
    );

    const angleDragged = angleDifference(
      angleDraggingFromToCenter,
      anglePointerToCenter,
    );

    this.setAngle(this.angle - angleDragged);

    this.draggingFrom = { ...pointerPosition };

    this.setState();
  }

  onDragEnd() {
    document.body.removeEventListener('pointermove', this.onDragProgress);
    document.body.removeEventListener('pointerup', this.onDragEnd);

    this.isDragging = false;
    this.playbackSpeed = 1;

    this.callbacks.onDragEnded(this.secondsPlayed);
  }

  autoRotate(timestampCurrent) {
    const timestampElapsed = timestampCurrent - this.timestampPrevious;
    let rotationSpeed =
      RADIANS_PER_MILLISECOND * timestampElapsed * this.playbackSpeed;

    rotationSpeed += 0.1;

    rotationSpeed = clamp(
      rotationSpeed,
      0,
      RADIANS_PER_MILLISECOND * timestampElapsed,
    );

    this.setAngle(this.angle + rotationSpeed);
  }

  setState() {
    this.el.style.transform = `rotate(${this.angle}rad)`;
  }

  setAngle(angle) {
    this.angle = clamp(angle, 0, this.maxAngle);

    return this.angle;
  }

  start() {
    this.timestampPrevious = performance.now();

    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.rafId);

    this.callbacks.onStop();
  }

  rewind() {
    this.setAngle(0);
  }

  loop() {
    const timestampCurrent = performance.now();

    if (!this.isDragging) {
      this.autoRotate(timestampCurrent);
    }

    const timestampDifferenceMS = timestampCurrent - this.timestampPrevious;

    const rotated = this.angle - this.anglePrevious;
    const rotationNormal = RADIANS_PER_MILLISECOND * timestampDifferenceMS;

    this.playbackSpeed = rotated / rotationNormal || 0;
    this.isReversed = this.angle < this.anglePrevious;

    this.anglePrevious = this.angle;
    this.timestampPrevious = performance.now();

    this.setState();

    const { playbackSpeed, isReversed, secondsPlayed, duration } = this;
    const progress = secondsPlayed / duration;

    this.callbacks.onLoop({
      playbackSpeed,
      isReversed,
      secondsPlayed,
      progress,
    });

    this.anglePrevious = this.angle;

    this.rafId = requestAnimationFrame(this.loop);
  }
}

export default Disc;
