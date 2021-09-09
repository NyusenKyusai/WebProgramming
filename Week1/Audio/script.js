let audioContainer = document.querySelector("#myAudio");

//console.log(audioContainer);

let playButton = document.querySelector("#playIt");
let pauseButton = document.querySelector("#pauseIt");
let stopButton = document.querySelector("#stopIt");
let volUpButton = document.querySelector("#volUp");
let volDownButton = document.querySelector("#volDown");

playButton.addEventListener("click", () => {
  audioContainer.play();
});

pauseButton.addEventListener("click", () => {
  audioContainer.pause();
});

stopButton.addEventListener("click", () => {
  audioContainer.pause();
  audioContainer.currentTime = 0;
});

volUpButton.addEventListener("click", () => {
  audioContainer.volume += 0.1;
});

volDownButton.addEventListener("click", () => {
  audioContainer.volume -= 0.1;
});
