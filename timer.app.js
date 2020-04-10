let state = "unset"; // -> set -> started -> set
let counter = 0;
let setValue = 0;
let counterInterval;
let buzzInterval;
const APP_TITLE = "TIMER";
const DEBOUNCE = 50;

function buzzAndBeep() {
  Bangle.buzz(1e3, 1).then(() => {
    Bangle.beep(200, 4000);
  });
}

function outOfTime() {
  if (counterInterval) return;
  E.showMessage("Out of Time\n\nBTN2 to reset", APP_TITLE);
  buzzAndBeep();
  buzzInterval = setInterval(buzzAndBeep, 10000);
}

function draw() {
  const minutes = Math.floor(counter / 60);
  const seconds = counter - minutes * 60;
  const seconds2Digits = seconds < 10 ? `0${seconds}` : seconds.toString();
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("6x8", 8); // vector font, 80px
  // draw the current counter value
  g.drawString(`${minutes}:${seconds2Digits}`, 120, 120);
  // optional - this keeps the watch LCD lit up
  g.flip();
}

function countDown() {
  console.log("counter", counter);
  // Out of time
  if (counter <= 0) {
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = undefined;
    }
    outOfTime();
    return;
  }

  counter--;

  draw();
}

function startTimer() {
  console.log("start timer");
  countDown();
  console.log("counterInterval", counterInterval);
  if (!counterInterval) {
    counterInterval = setInterval(countDown, 1000);
  }
}

function stopTimer() {
  console.log("stop timer");
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = undefined;
  }
  if (buzzInterval) {
    clearInterval(buzzInterval);
    buzzInterval = undefined;
  }
}

function getDelta() {
  if (counter < 30) {
    return 1;
  } else if (counter < 60) {
    return 5;
  } else {
    return 10;
  }
}

function increaseTimer() {
  counter += getDelta();
  setValue = counter;
  if (state === "unset") {
    state = "set";
  }
  draw();
  setTimeout(() => {
    if (BTN5.read()) {
      increaseTimer();
    }
  }, DEBOUNCE);
}

function decreaseTimer() {
  counter = Math.max(0, counter - getDelta());
  setValue = counter;
  draw();
  setTimeout(() => {
    if (BTN4.read()) {
      decreaseTimer();
    }
  }, DEBOUNCE);
}

function reset(value) {
  console.log("reset", value);
  counter = value;
  stopTimer();
  draw();
}

function handleBtn2() {
  console.log("state", state);
  if (state === "unset") {
    return;
  } else if (state === "set") {
    state = "started";
    startTimer();
  } else if (state === "started") {
    state = "set";
    reset(setValue);
  }
}

setWatch(handleBtn2, BTN2, { debounce: 500, repeat: true });

setWatch(decreaseTimer, BTN4, { debounce: DEBOUNCE, repeat: true });

setWatch(increaseTimer, BTN5, { debounce: DEBOUNCE, repeat: true });

reset(0);
E.showMessage("Tap right, time UP\n\nleft time DOWN", APP_TITLE);
