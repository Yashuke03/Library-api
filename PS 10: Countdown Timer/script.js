let time = 0;
let interval = null;

function startTimer() {
  if (interval) return;

  const input = document.getElementById("minutes").value;

  if (time === 0) {
    time = input * 60;
  }

  interval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (time <= 0) {
    clearInterval(interval);
    interval = null;
    alert("Time's up!");
    return;
  }

  time--;

  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  document.getElementById("display").textContent =
    String(minutes).padStart(2, '0') + ":" +
    String(seconds).padStart(2, '0');
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  time = 0;
  document.getElementById("display").textContent = "00:00";
}