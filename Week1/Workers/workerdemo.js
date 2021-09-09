"use script";

const isPrime = (n) => {
  if (n < 2) return false;

  for (let i = 2; i < n; i++) {
    if (n % i == 0) {
      return false;
    }
  }
  return true;
};

let val = 500000;
let count = 0;

for (let i = 0; i < val; i++) {
  let a = isPrime(i);
  if (a) {
    count++;
    postMessage(count);
  }
}
