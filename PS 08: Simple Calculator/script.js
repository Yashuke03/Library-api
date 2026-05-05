const display = document.getElementById("display");

function appendValue(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function calculate() {
  try {
    // Handle division by zero
    if (display.value.includes("/0")) {
      display.value = "Error";
      return;
    }

    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}