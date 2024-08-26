import type { Vector } from '@/types/Vector';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const distanceBetween = (vec1: Vector, vec2: Vector) =>
  Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const getElementCenter = (el: HTMLElement): Vector => {
  const { left, top, width, height } = el.getBoundingClientRect();

  const x = left + width / 2;
  const y = top + height / 2;

  return { x, y };
};

const angleBetween = (vec1: Vector, vec2: Vector) =>
  Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const angleDifference = (x: number, y: number) =>
  Math.atan2(Math.sin(x - y), Math.cos(x - y));

export {
  clamp,
  getElementCenter,
  distanceBetween,
  angleBetween,
  angleDifference,
};
