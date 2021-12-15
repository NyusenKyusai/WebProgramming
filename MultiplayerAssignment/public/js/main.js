"use strict";

import * as functions from "./usefulFunctions.js";

let socket = io();
let regpanel = document.getElementById("regpanel");
let lobbypanel = document.getElementById("lobbypanel");
let gamepanel = document.getElementById("gamepanel");
let lobbylist = document.getElementById("roomplayers");
let nicknameSpan = document.getElementById("nicknameSpan");
let finishedPanel = document.getElementById("finishedPanel");
let podium = document.getElementById("podium");
let connections = [];
let roomMembers = [];
let playing = false;
let roomfull = false;
let interval;
let viewportInit;
let viewportAnimateComplete;
let socketID;
let playerName;

let easelCan, easelCTX, loader, stage, stageHeight, stageWidth;

let timestamps = [];
let datastamps = [];
let objs = [];

let framerate = 60;
let R2D = 180 / Math.PI;

let playerX = 0;
let playerY = 0;

const makeBitmap = (loaderImg, b2x, b2y, yadjust = 0) => {
  let theImage = new createjs.Bitmap(loaderImg);

  let scaleX = (b2x * 2) / theImage.image.naturalWidth;
  let scaleY = (b2y * 2) / theImage.image.naturalHeight;

  theImage.scaleX = scaleX;
  theImage.scaleY = scaleY;

  theImage.regX = theImage.image.width / 2;
  theImage.regY = theImage.image.height / 2 - yadjust;

  theImage.snapToPixel = true;

  return theImage;
};

const tick = (e) => {
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
};

const init = () => {
  easelCan = document.getElementById("easelcan");
  easelCTX = easelCan.getContext("2d");
  stage = new createjs.Stage(easelCan);
  stage.snapPixelsEnabled = true;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;

  let manifest = [
    { src: "./assets/background.png", id: "background" },
    { src: "./assets/barrier.png", id: "barriers" },
    { src: "./assets/player1.png", id: "player1" },
    { src: "./assets/player2.png", id: "player2" },
    { src: "./assets/player3.png", id: "player3" },
    { src: "./assets/player4.png", id: "player4" },
    { src: "./assets/shell.png", id: "shell" },
    { src: "./assets/start.png", id: "start" },
    { src: "./assets/finish.png", id: "finish" },
    { src: "./assets/powerUp.png", id: "powerUp" },
    { src: "./assets/boost.wav", id: "boost" },
  ];

  loader = new createjs.LoadQueue(false);
  loader.installPlugin(createjs.Sound);
  createjs.Sound.alternateExtensions = ["ogg"];
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true);
};

const handleComplete = () => {
  let easelBackgroud = makeBitmap(
    loader.getResult("background"),
    stageWidth,
    stageHeight
  );

  easelBackgroud.x = stageWidth;
  easelBackgroud.y = stageHeight;

  stage.addChild(easelBackgroud);

  createjs.Ticker.framerate = framerate;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);

  let initialised = false;

  socket.on("objectData", (data) => {
    for (let i in data) {
      //console.log(data);

      if (!initialised && data[i].id == "wall") {
        objs.push({
          bitmap: makeBitmap(
            loader.getResult("barriers"),
            data[i].objwidth,
            data[i].objheight
          ),
          uniquename: data[i].uniquename,
        });
        stage.addChild(objs[objs.length - 1].bitmap);
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      if (!initialised && data[i].id == "sensor") {
        if (data[i].uniquename == "start") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("start"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        if (data[i].uniquename == "finish") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("finish"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        if (data[i].uniquename == "powerUp") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("powerUp"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }
        stage.addChild(objs[objs.length - 1].bitmap);
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      if (!initialised && data[i].id == "player") {
        if (data[i].uniquename == "player1") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("player1"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        if (data[i].uniquename == "player2") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("player2"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        if (data[i].uniquename == "player3") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("player3"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        if (data[i].uniquename == "player4") {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("player4"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }
        stage.addChild(objs[objs.length - 1].bitmap);
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      if (data[i].id == "player") {
        let index = functions.findIndexBitmap(objs, data[i].uniquename);

        objs[index].bitmap.x = data[i].x;
        objs[index].bitmap.y = data[i].y;
        objs[index].bitmap.rotation = data[i].r * R2D;

        if (playerName == data[i].uniquename) {
          playerX = data[i].x;
          playerY = data[i].y;
        }
      }

      if (data[i].id == "shell") {
        let index = functions.findIndexBitmap(objs, data[i].uniquename);

        if (index == -1) {
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("shell"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });

          // console.log(objs[i]);
          // console.log(data[i]);
          objs[objs.length - 1].bitmap.x = data[i].x;
          objs[objs.length - 1].bitmap.y = data[i].y;
          objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;

          //console.log(objs[index]);
        }

        if (index != -1) {
          // console.log(objs[index]);

          objs[index].bitmap.x = data[i].x;
          objs[index].bitmap.y = data[i].y;
          objs[index].bitmap.rotation = data[i].r * R2D;
        }

        // objs.forEach((object) => {
        //   console.log(object.uniquename);
        // });
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

    //console.log(stage);
  });
};

init();

regpanel.addEventListener("submit", (e) => {
  e.preventDefault();

  if (e.target.nickname.value) {
    let nickname = e.target.nickname.value;

    nicknameSpan.innerText = "You are " + nickname;

    socket.emit("reguser", nickname);
  }
});

socket.on("connectionlist", (_connections) => {
  connections = _connections;
});

socket.on("rooms", (_rooms) => {
  let outputHTML = "";

  roomMembers = _rooms;

  //console.log(roomMembers);

  for (let i in roomMembers) {
    let r = functions.findIndex(connections, roomMembers[i]);

    //console.log(r);

    outputHTML +=
      "<li name='" +
      connections[r].nickname +
      "' id='" +
      connections[r].socket +
      "'>" +
      connections[r].nickname +
      "</li>";
  }

  for (let i = 0; i < 4 - roomMembers.length; i++) {
    outputHTML += "<li>Looking for player</li>";
  }

  //console.log(outputHTML);
  lobbylist.innerHTML = outputHTML;
});

socket.on("registered", () => {
  regpanel.classList.remove("active");
  lobbypanel.classList.add("active");
});

socket.on("roomfull", () => {
  lobbypanel.classList.remove("active");
  gamepanel.classList.add("active");

  let index = roomMembers.findIndex((element) => element == socketID);

  switch (index) {
    case 0:
      playerName = "player1";
      break;
    case 1:
      playerName = "player2";
      break;
    case 2:
      playerName = "player3";
      break;
    case 3:
      playerName = "player4";
      break;
  }

  roomfull = true;

  playing = true;

  functions.followPlayer(
    viewportInit,
    viewportAnimateComplete,
    playerX,
    playerY
  );

  setTimeout(function () {
    viewportAnimateComplete = true;
  }, 2000);

  interval = setInterval(function () {
    functions.followPlayer(
      viewportInit,
      viewportAnimateComplete,
      playerX,
      playerY
    );
  }, 1000 / framerate);

  viewportInit = true;

  // setTimeout(function () {
  //   viewportAnimateComplete = true;
  // }, 2000);
});

socket.on("returntolobby", () => {
  gamepanel.classList.remove("active");
  finishedPanel.classList.remove("active");

  if (roomfull) {
    lobbypanel.classList.add("active");
    roomfull = false;
  }

  playing = false;
});

$(document).keydown((e) => {
  if (playing) {
    socket.emit("keydown", e.key);
  }
});

$(document).keyup((e) => {
  if (playing) {
    socket.emit("keyup", e.key);
  }
});

socket.on("racefinished", (podiumServer) => {
  let outputHTML = functions.createPodiumHTML(
    roomMembers,
    podiumServer,
    connections
  );

  podium.innerHTML = outputHTML;

  gamepanel.classList.remove("active");
  finishedPanel.classList.add("active");
});

socket.on("socketID", (id) => {
  socketID = id;
});

socket.on("boost", () => {
  createjs.Sound.play("boost");
});
