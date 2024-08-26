# Create a turntable with the Web Audio API

Browsers are awesome. And so is the Audio API. Capable of a lot, but here I'm only going to use the basics: loading sound and controlling the playback speed.

The article will be in few parts:

1.  The record: making it spin and able to drag cq. scratch
2.  The audio: loading, reversing and controlling the playback speed
3.  Tying the record to the audio
4.  Improvements

_For the sake of the length of the article, the provided code blocks are simplified and are more like examples than actual implementation. Please refer to the Github repo for the actual code._
**TODO: LINK TO GITHUB REPO**

## The record

A real turntable consists of a multitude of elements, but for this article I'll focus on the record.

### What should the record do?

- Rotate: Whether "by hand" or automatically.
- Stop: When I click it, it should simulate pressing a finger on the record forcing it to stop.
- Dragging: Simulating the scratching effect, going back and forth.

### The Record implementation

It should have some properties

- `angle`: a `number` which tracks the current rotation
- `isAutoRotating`: a `boolean` whether the record should rotate on its own or not (eg. when I'm "scratching")
- `pointerStartPosition`: a `Vector` of the starting drag position
- `center`: a `Vector` indicating the centre of the UI element

And some functions and listeners:

- `pointerup`, `pointerdown` and `pointermove` to track the dragging / scratching.
- A `loop` function called in a `requestAnimationFrame` to update the UI.

Within the `pointerdown` listener I'll indicate that the record should not rotate automatically and setting the starting drag position:
**NOTE: LINK TO GITHUB FILE AND LINE**

```js
 onPointerDown(e: PointerEvent) {
  this.isAutoRotating = false;

  this.pointerStartPosition = {
    x: e.clientX,
    y: e.clientY,
  };
}
```

```js
onPointerUp() {
  this.isAutoRotating = true;
}
```

Now to determine the angle that was dragged, a little math is required:

```js
// 2 helper functions
const angleBetween = (vec1: Vector, vec2: Vector) = Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const angleDifference = ({ x, y }: Vector) => Math.atan2(Math.sin(x - y), Math.cos(x - y));

onPointerMove({ clientX, clientY }: PointerEvent) {
  const pointerCurrentPosition: Vector = { x: clientX, y: clientY };

  const angleBetweenCurrentAndCenter = angleBetween(this.center, pointerCurrentPosition);
  const angleBetweenStartAndCenter = angleBetween(this.center, this.pointerStartPosition);

  const angleDragged = angleDifference({
    x: angleBetweenStartAndCenter,
    y: angleBetweenCurrentAndCenter,
  });

  this.pointerStartPosition = { ...pointerCurrentPosition };

  this.setAngle(this.angle - angleDragged);
}
```

The `setAngle` function is pretty simple luckily:

```
setAngle(angle: number) {
  this.angle = angle;
}
```

Now the only thing needed is a looping function to update the record visual:

```js
loop() {
  if (this.isAutoRotating) {
    this.setAngle(this.angle + 0.05);
  }

  this.element.style.transform = `rotate(${this.angle}rad)`;

  requestAnimationFrame(this.loop);
}
```

And the result is the record spinning on its own, until the user clicks and drags it:
![](record-spinning.mov)

## Determine playback speed

Now for the nitty gritty part: calculating the rotation speed, which is also used for the playback speed.
The following data is required:

- How many turns does the record make in 1 minute (RPM)?
- How many degrees should it rotate per MS, for a playback speed of 1?
- How many MS did elapse between 2 updates?
- How many degrees did the record actually rotate?

With that data the actual playback speed can be calculated as follows:
![Canculating playback speed](./calcuate-playback-speed.svg)

Altering the `loop` function, it should look sokmething like this:

```js
loop() {
  const currentTimestamp = performance.now();
  const differenceTimestamp = currentTimestamp - this.previousTimestamp;

  if (this.isAutoRotating) {
    this.autoRotate(differenceTimestamp);
  }

  const differenceRotation = this.angle - this.previousAngle;
  const normalRotation = RADIANS_PER_MS * differenceTimestamp;
  const playbackSpeed = differenceRotation / normalRotation;

  this.element.style.transform = `rotate(${this.angle}rad)`;

  this.previousAngle = this.angle;
  this.previousTimestamp = currentTimestamp;

  requestAnimationFrame(this.loop);
}
```

Note that it calls the new function `autoRotate`:

```js
autoRotate(msElapsed: number) {
  const rotationSpeed = RADIANS_PER_MS * msElapsed;

  this.setAngle(this.angle + rotationSpeed);
}
```

With the last additions nothing has changed visually. But now the record can be dragged and the playback speed is calculated.  
Time to look at the audio.

## The audio

Loading the audio is pretty straight forward using a simple `fetch`.  
The response, which will be an `ArrayBuffer`, is used to create an `AudioBuffer`. Once that is created, an `AudioBufferSourceNode` can be made which whill be the actual sound source that can be controlled.

```js
const context = new AudioContext();

const response = await fetch(url);
const buffer = await response.arrayBuffer();
const audioBuffer = await context.decodeAudioData(buffer);

const source = new AudioBufferSourceNode(context);

source.buffer = audioBuffer;
source.connect(context.destination);
source.start();
```

### Reversing the audio

The `AudioBufferSourceNode` has the `playbackRate` property to set the playback speed. But it has to be greater than `0` and therefore it can't be used to play the source in reverse as is.

The audioBuffer has "channel data" which is "PCM data". Which isn't interesting, but what is interesting, is the fact it is of type `Float32Array`:

```js
const channelData = audioBuffer.getChannelData(0); //float32Array
```

And this is where the trick comes in. Like any array, a `Float32Array` can be reversed. And a new AudioBuffer can be created with a given ChannelData:

```js
// copy and reverse
const channelDataReversed = channelData.slice(0).reverse();

// create new audioBuffer with new channelData
const audioBuffer = new AudioBuffer(...)
audioBufferReversed.getChannelData(0).set(channelDataReversed);
```
