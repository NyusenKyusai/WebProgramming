// Define Vars to hold time values
class stopWatch {
  seconds = 0;
  minutes = 0;
  hours = 0;

  // Define vars to hold display value
  displaySeconds = 0;
  displayMinutes = 0;
  displayHours = 0;

  constructor() {
    setInterval(stopwatch, 1000);
  }

  // Stopwatch Function (logic to determine when to increment next value)

  stopwatch = () => {
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

    document.getElementById("display").innerHTML =
      displayHours + ":" + displayMinutes + ":" + displaySeconds;
  };
}
