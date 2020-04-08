let counter = 0;
let counterInterval;
let started = false;
let buzzInterval;
const APP_TITLE = "TIMER";
const DEBOUNCE = 20;

function outOfTime() {
  if (counterInterval) return;
  E.showMessage("Out of Time\n\nBTN2 to reset", APP_TITLE);
  Bangle.buzz();
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
    .then(() => Bangle.beep(200, 3000));
  // again, 10 secs later
  buzzInterval = setTimeout(outOfTime, 10000);
}

function draw() {
  const minutes = Math.floor(counter / 60);
  const seconds = counter - minutes * 60;
  const seconds2Digits = seconds < 10 ? `0${seconds}` : seconds.toString();
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("Vector", 80); // vector font, 80px
  // draw the current counter value
  g.drawString(`${minutes}:${seconds2Digits}`, 120, 120);
  // optional - this keeps the watch LCD lit up
  g.flip();
}

function countDown() {
  // Out of time
  if (counter <= 0) {
    if (counterInterval) clearInterval(counterInterval);
    counterInterval = undefined;
    outOfTime();
    return;
  }

  counter--;

  draw();
}

function startTimer() {
  countDown();
  if (!counterInterval) counterInterval = setInterval(countDown, 1000);
}

function increaseTimer() {
  if (!started) {
    started = true;
    startTimer();
  }
  counter += 5;
  console.log("press", BTN5.read());
  draw();
  if (BTN5.read()) {
    setTimeout(increaseTimer, DEBOUNCE);
  }
}

function decreaseTimer() {
  counter = Math.max(0, counter - 5);
  draw();
  if (BTN4.read()) {
    setTimeout(decreaseTimer, DEBOUNCE);
  }
}

function clearTimer() {
  counter = 0;
  started = false;
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = undefined;
  }
  if (buzzInterval) {
    clearInterval(buzzInterval);
    buzzInterval = undefined;
  }
  E.showMessage("Tap right, time UP\n\nleft time DOWN", APP_TITLE);
}

setWatch(decreaseTimer, BTN4, { repeat: true });

setWatch(increaseTimer, BTN5, { debounce: 0, repeat: true });

setWatch(clearTimer, BTN2, { repeat: true });

clearTimer();
