// Define Vars to hold time values

let seconds = 0;
let minutes = 0;
let hours = 0;

// Define vars to hold display value
let displaySeconds = 0;
let displayMinutes = 0;
let displayHours = 0;

// Stopwatch Function (logic to determine when to increment next value)

let stopwatch = () => {
  seconds++;

  // Logic to determine when to increment next value

  if (seconds / 60 === 1) {
    seconds = 0;
    minutes++;

    if (minutes / 60 === 1) {
      minutes = 0;
      hours++;
    }
  }

  // If seconds/minutes/hours are only one difit, add a leading 0 to the value

  if (seconds < 10) {
    displaySeconds = "0" + seconds.toString();
  } else {
    displaySeconds = seconds;
  }

  if (minutes < 10) {
    displayMinutes = "0" + minutes.toString();
  } else {
    displayHours = minutes;
  }

  if (hours < 10) {
    displayHours = "0" + hours.toString();
  } else {
    displayHours = hours;
  }

  // Display updated time values to user

  document.getElementById("display").innerText =
    "Current Run: " +
    displayHours +
    ":" +
    displayMinutes +
    ":" +
    displaySeconds;
};

setInterval(stopwatch, 1000);
