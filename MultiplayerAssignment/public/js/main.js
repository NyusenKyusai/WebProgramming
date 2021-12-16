"use strict";

// Importing the functions
import * as functions from "./usefulFunctions.js";

// Setting the socket variable to io()
let socket = io();
// Creating the getElementById's of all the divs
let regpanel = document.getElementById("regpanel");
let lobbypanel = document.getElementById("lobbypanel");
let gamepanel = document.getElementById("gamepanel");
let lobbylist = document.getElementById("roomplayers");
let nicknameSpan = document.getElementById("nicknameSpan");
let finishedPanel = document.getElementById("finishedPanel");
let podium = document.getElementById("podium");
// Creating the connections and roomMembers arrays
let connections = [];
let roomMembers = [];
// Creating variables
let playing = false;
let roomfull = false;
let interval;
let viewportInit;
let viewportAnimateComplete;
let socketID;
let playerName;

// Easel variables
let easelCan, easelCTX, loader, stage, stageHeight, stageWidth;

// Timestamps and datastamps
let timestamps = [];
let datastamps = [];
// Easel objects array
let objs = [];

// Framerate and radians to degrees
let framerate = 60;
let R2D = 180 / Math.PI;

// Getting the player x and y
let playerX = 0;
let playerY = 0;

// Method to create bitmaps
const makeBitmap = (loaderImg, b2x, b2y, yadjust = 0) => {
  // Getting the image using the loader and creating a bitmap
  let theImage = new createjs.Bitmap(loaderImg);

  // Getting the scale of the image in x and y
  let scaleX = (b2x * 2) / theImage.image.naturalWidth;
  let scaleY = (b2y * 2) / theImage.image.naturalHeight;

  // Setting the scalre
  theImage.scaleX = scaleX;
  theImage.scaleY = scaleY;

  // Getting the location of where the image is generated
  theImage.regX = theImage.image.width / 2;
  theImage.regY = theImage.image.height / 2 - yadjust;

  // Setting snapToPixel to true
  theImage.snapToPixel = true;

  // Returning the image
  return theImage;
};

// Creating a tick method
const tick = (e) => {
  // Handling the ticking using the performance
  const now = performance.now();

  // While loop that shifts the timestamps
  while (timestamps.length > 0 && timestamps[0] <= now - 1000) {
    timestamps.shift();
  }

  // Pushing the performance to the timestamps
  timestamps.push(now);

  // If statement that handled the framerate
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

  // Setting the framerate to the Ticker, fps html, and stage update
  createjs.Ticker.framerate = framerate;
  document.getElementById("fps").innerHTML = " fps " + framerate;

  stage.update(e);
};

// Method that initialises the easel
const init = () => {
  // Getting the easel canvas and setting the context to 2d
  easelCan = document.getElementById("easelcan");
  easelCTX = easelCan.getContext("2d");
  // Creating the stage as the easel canvas, setting snapPixelsEnabled to true
  // And setting the width and height
  stage = new createjs.Stage(easelCan);
  stage.snapPixelsEnabled = true;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;

  // Setting the manigest for the images
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

  // setting the loader, initialising the sound js and creating a complete event listener
  // Passing in the handle complete
  loader = new createjs.LoadQueue(false);
  loader.installPlugin(createjs.Sound);
  createjs.Sound.alternateExtensions = ["ogg"];
  loader.addEventListener("complete", handleComplete);
  // Loading the manifest
  loader.loadManifest(manifest, true);
};

// Method that creates the bitmaps when the loader loads the manifest
const handleComplete = () => {
  // Creating the bitmap and setting the width and height
  let easelBackgroud = makeBitmap(
    loader.getResult("background"),
    stageWidth,
    stageHeight
  );

  // Setting the position in the x and y to the stage width and stage height
  easelBackgroud.x = stageWidth;
  easelBackgroud.y = stageHeight;

  // Adding the background to the stage as a child
  stage.addChild(easelBackgroud);

  // Setting the Ticker framerate and timing mode
  createjs.Ticker.framerate = framerate;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  // Creating a tick event listener
  createjs.Ticker.addEventListener("tick", tick);

  // Setting initialised to false
  let initialised = false;

  // Handling the objectData socket
  socket.on("objectData", (data) => {
    // For loop thet iterated trough the array of objects
    for (let i in data) {
      //console.log(data);

      // If statement that handles the first object creation
      // Walls
      if (!initialised && data[i].id == "wall") {
        // Pushing the bitmaps for the walls
        objs.push({
          bitmap: makeBitmap(
            loader.getResult("barriers"),
            data[i].objwidth,
            data[i].objheight
          ),
          uniquename: data[i].uniquename,
        });
        // Adding the childs to the stage of the latest object
        stage.addChild(objs[objs.length - 1].bitmap);
        // Setting it's position
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      // Sensor
      if (!initialised && data[i].id == "sensor") {
        // If the sensor is the start line
        if (data[i].uniquename == "start") {
          // Pushing bitmap object to the array
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("start"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        // If the sensor is the finish line
        if (data[i].uniquename == "finish") {
          // Pushing the bitmap object to the array
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("finish"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        // If the sensor is the powerup
        if (data[i].uniquename == "powerUp") {
          // Pushiong the bitmap object to the array
          objs.push({
            bitmap: makeBitmap(
              loader.getResult("powerUp"),
              data[i].objwidth,
              data[i].objheight
            ),
            uniquename: data[i].uniquename,
          });
        }

        // Adding the child to the stage of the latest added object
        stage.addChild(objs[objs.length - 1].bitmap);
        // Setting the position and rotation
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      // If statement that spawns in the player on initialization
      if (!initialised && data[i].id == "player") {
        // Player 1 bitmap creation
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

        // Player 2 bitmap creation
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

        // Player 3 bitmap creation
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

        // Player 4 bitmap creation
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
        // Adding the childs to the stage of the latest object
        stage.addChild(objs[objs.length - 1].bitmap);
        // Setting the position
        objs[objs.length - 1].bitmap.x = data[i].x;
        objs[objs.length - 1].bitmap.y = data[i].y;
        objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;
      }

      // Setting the position of the player after init
      if (data[i].id == "player") {
        // Finding the index in the bitmap
        let index = functions.findIndexBitmap(objs, data[i].uniquename);

        // Setting the position
        objs[index].bitmap.x = data[i].x;
        objs[index].bitmap.y = data[i].y;
        objs[index].bitmap.rotation = data[i].r * R2D;

        // If the current browser is the current player
        if (playerName == data[i].uniquename) {
          // Setting the player x and y
          playerX = data[i].x;
          playerY = data[i].y;
        }
      }

      // If statement for the shell
      if (data[i].id == "shell") {
        // Finding the index of the bitmap array
        let index = functions.findIndexBitmap(objs, data[i].uniquename);

        // Handling if the bitmap does not exist
        if (index == -1) {
          // Creating the bitmap using the shell
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
          // Setting the position of the new bitmap
          objs[objs.length - 1].bitmap.x = data[i].x;
          objs[objs.length - 1].bitmap.y = data[i].y;
          objs[objs.length - 1].bitmap.rotation = data[i].r * R2D;

          //console.log(objs[index]);
        }

        // Handling the bitmap when it does exist
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

    // Handling the datastamps
    const now = performance.now();
    while (datastamps.length > 0 && datastamps[0] <= now - 1000) {
      datastamps.shift();
    }

    datastamps.push(now);

    // Handling the data rate html element
    document.getElementById("datarate").innerHTML =
      " datarate " + datastamps.length;

    // Setting initialised to true
    initialised = true;

    //console.log(stage);
  });
};

// Calling the init method
init();

// Creating a submit event to the registration form
regpanel.addEventListener("submit", (e) => {
  // Preventing the default behaviour
  e.preventDefault();

  // If the value exists
  if (e.target.nickname.value) {
    // Creates the nickname
    let nickname = e.target.nickname.value;
    // Sets the nickname on the browser side
    nicknameSpan.innerText = "You are " + nickname;

    // Emits to the server that the user has registered
    socket.emit("reguser", nickname);
  }
});

// Handling the connection list emit
socket.on("connectionlist", (_connections) => {
  connections = _connections;
});

// Handling the rooms emit
socket.on("rooms", (_rooms) => {
  let outputHTML = "";

  // Setting the roomMembers array to the passed in room
  roomMembers = _rooms;

  //console.log(roomMembers);

  // For loop to create the unordered list for the lobby using the passed room
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

  // Setting the rest of the spots to looking for player
  for (let i = 0; i < 4 - roomMembers.length; i++) {
    outputHTML += "<li>Looking for player</li>";
  }

  //console.log(outputHTML);
  // Setting the html
  lobbylist.innerHTML = outputHTML;
});

// Handling the registered emit by deciding which class is active
socket.on("registered", () => {
  regpanel.classList.remove("active");
  lobbypanel.classList.add("active");
});

// Handling when the room is full
socket.on("roomfull", () => {
  // Changing which panel is active
  lobbypanel.classList.remove("active");
  gamepanel.classList.add("active");

  // Seeing which user this is
  let index = roomMembers.findIndex((element) => element == socketID);

  // Setting their player name depending on their position in the array
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

  // Setting roomfull to true
  roomfull = true;
  // Setting player to true
  playing = true;

  // Starting the reactive viewport :/
  functions.followPlayer(
    viewportInit,
    viewportAnimateComplete,
    playerX,
    playerY
  );

  // Setting the timeout for when the animation completes
  setTimeout(function () {
    viewportAnimateComplete = true;
  }, 2000);

  // Setting the interval to the framerate for following the player
  interval = setInterval(function () {
    functions.followPlayer(
      viewportInit,
      viewportAnimateComplete,
      playerX,
      playerY
    );
  }, 1000 / framerate);

  // Setting the viewport to be initialised
  viewportInit = true;

  // setTimeout(function () {
  //   viewportAnimateComplete = true;
  // }, 2000);
});

// Handling returning to the lobby when a user leaves
socket.on("returntolobby", () => {
  // Removing the game panels
  gamepanel.classList.remove("active");
  finishedPanel.classList.remove("active");

  // Adding the lobby panel as active if the room was full
  if (roomfull) {
    lobbypanel.classList.add("active");
    roomfull = false;
  }

  // Setting playing to false
  playing = false;
});

// Handling the key down event and emitting if the user is playing
$(document).keydown((e) => {
  if (playing) {
    socket.emit("keydown", e.key);
  }
});

// Handling the key up event and emitting if the user is playing
$(document).keyup((e) => {
  if (playing) {
    socket.emit("keyup", e.key);
  }
});

// Handling the race finished emit
socket.on("racefinished", (podiumServer) => {
  // Creating the html for the podium
  let outputHTML = functions.createPodiumHTML(
    roomMembers,
    podiumServer,
    connections
  );

  // Setting the podium html
  podium.innerHTML = outputHTML;

  // Changing the active panel
  gamepanel.classList.remove("active");
  finishedPanel.classList.add("active");
});

// Handling the socketID emit
socket.on("socketID", (id) => {
  socketID = id;
});

// Handling the boost emit to play sound
socket.on("boost", () => {
  createjs.Sound.play("boost");
});
