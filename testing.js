let firstNumber = 0;
let secondNumber = 0;
let fibonnaciString = "";

for (let i = 0; i < 20; i++) {
  if (i == 0) {
    fibonnaciString = "1, ";
  } else if (i == 1) {
    fibonnaciString += "1, ";
    firstNumber = 1;
    secondNumber = 1;
  } else if (i == 19) {
    fibonnaciString += firstNumber + secondNumber;

    temp = firstNumber + secondNumber;
    //console.log("First Number1: " + firstNumber);
    firstNumber = secondNumber;
    //console.log("First Number2: " + firstNumber);
    //console.log("Second Number1: " + firstNumber);
    secondNumber = temp;
    //console.log("Second Number2: " + firstNumber);
  } else {
    fibonnaciString += firstNumber + secondNumber + ", ";

    temp = firstNumber + secondNumber;
    //console.log("First Number1: " + firstNumber);
    firstNumber = secondNumber;
    //console.log("First Number2: " + firstNumber);
    //console.log("Second Number1: " + firstNumber);
    secondNumber = temp;
    //console.log("Second Number2: " + firstNumber);
  }
}
console.log(fibonnaciString);
