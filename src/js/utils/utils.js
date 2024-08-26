
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const lerp = (norm, min, max) => (max - min) * norm + min;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const wrapArrayIndex = (index, array) => (index + 1 + array.length) % array.length;

const toRadian = degrees => degrees * Math.PI / 180;
const toDegrees = radians => radians * 180 / Math.PI;

const pixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const getElementCenter = (el) => {
	const { left, top, width, height }  = el.getBoundingClientRect();

	const x =  left + width / 2;
	const y =  top + height / 2;

	return { x, y };
};

const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const angleDifference = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;

export {
	qs,
	qsa,
	map,
	lerp,
	clamp,
	wrapArrayIndex,
	getElementCenter,
	toRadian,
	toDegrees,
	pixelIndex,
	distanceBetween,
	angleBetween,
	angleDifference,
	randomArrayValue,
	randomBetween,
};
