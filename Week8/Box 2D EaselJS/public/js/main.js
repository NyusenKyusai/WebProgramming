"use strict";

let socket = io();

/*****
 * EaselJS Globals
 */

let easelCan, easelCTX, loader, stage, stageHeight, stageWidth;
let timestamps = [];
let framerate = 60;
let datastamps = [];

let objs = [];

let R2D = 180 / Math.PI;

/**
 * Easel Helper Function
 */

function makeBitmap(loaderImg, b2x, b2y, yadjust = 0) {
  // Setting theImage variable to a Bitmap of the loaderimg
  let theImage = new createjs.Bitmap(loaderImg);
  // Setting the scale x and y of the image
  let scaleX = (b2x * 2) / theImage.image.naturalWidth;
  let scaleY = (b2y * 2) / theImage.image.naturalHeight;
  // Setting theImage scale to the variables previously created
  theImage.scaleX = scaleX;
  theImage.scaleY = scaleY;
  // Setting the regX and the regY
  theImage.regX = theImage.image.width / 2;
  theImage.regY = theImage.image.height / 2 - yadjust;

  theImage.snapToPixel = true;
  // Returning the image
  return theImage;
}

function tick(e) {
  const now = performance.now();

  while (timestamps.length > 0 && timestamps[0] <= now - 1000) {
    timestamps.shift();
  }

  timestamps.push(now);

  if (timestamps.length < 45) {
    framerate = 30;
  } else if (timestamps.length < 75) {
    framerate = 60;
  } else if (timestamps.length < 105) {
    framerate = 90;
  } else if (timestamps.length < 130) {
    framerate = 120;
  } else if (timestamps.length < 160) {
    framerate = 144;
  } else {
    framerate = 240;
  }

  createjs.Ticker.framerate = framerate;
  document.getElementById("fps").innerHTML = " fps " + framerate;

  stage.update(e);
}

function init() {
  easelCan = document.getElementById("easelcan");
  easelCTX = easelCan.getContext("2d");
  stage = new createjs.Stage(easelCan);
  stage.snapPixelsEnabled = true;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;

  let manifest = [
    { src: "./assets/crate.png", id: "box" },
    { src: "./assets/soccer_ball.png", id: "ball" },
    { src: "./assets/plankv.png", id: "border" },
    { src: "./assets/background.png", id: "background" },
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true);
}

function handleComplete() {
  let easelbackground = makeBitmap(
    loader.getResult("background"),
    stageWidth,
    stageHeight + 220
  );

  easelbackground.x = 0;
  easelbackground.y = 0;

  stage.addChild(easelbackground);

  createjs.Ticker.framerate = framerate;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);

  let initialised = false;

  socket.on("objectData", function (data) {
    for (let i in data) {
      if (!initialised && data[i].id == "bord") {
        objs.push(
          makeBitmap(
            loader.getResult("border"),
            data[i].objwidth,
            data[i].objheight
          )
        );
        stage.addChild(objs[objs.length - 1]);
      }
      if (!initialised && data[i].id == "rand") {
        if (data[i].iscircle) {
          objs.push(
            makeBitmap(
              loader.getResult("ball"),
              data[i].objwidth / 2,
              data[i].objheight / 2
            )
          );
        } else {
          objs.push(
            makeBitmap(
              loader.getResult("box"),
              data[i].objwidth,
              data[i].objheight
            )
          );
        }
        stage.addChild(objs[objs.length - 1]);
      }
      if (data[i].id == "rand") {
        objs[i].x = data[i].x;
        objs[i].y = data[i].y;
        objs[i].rotation = data[i].r * R2D;
      }
    }

    const now = performance.now();
    while (datastamps.length > 0 && datastamps[0] <= now - 1000) {
      datastamps.shift();
    }

    datastamps.push(now);
    document.getElementById("datarate").innerHTML =
      " datarate " + datastamps.length;

    initialised = true;
  });
}

init();

$(document).keyup(function (e) {
  socket.emit("keypress", "keypress");
});
