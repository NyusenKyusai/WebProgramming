"use strict";

import * as functions from "./usefulFunctions.js";

let socket = io();
let regpanel = document.getElementById("regpanel");
let lobbypanel = document.getElementById("lobbypanel");
let gamepanel = document.getElementById("gamepanel");
let lobbylist = document.getElementById("roomplayers");
let nicknameSpan = document.getElementById("nicknameSpan");
let connections = [];
let roomMembers = [];

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

  console.log(roomMembers);

  for (let i in roomMembers) {
    let r = functions.findIndex(connections, roomMembers[i]);

    console.log(r);

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

  console.log(outputHTML);
  lobbylist.innerHTML = outputHTML;
});

socket.on("registered", () => {
  regpanel.classList.remove("active");
  lobbypanel.classList.add("active");
});

socket.on("roomfull", () => {
  lobbypanel.classList.remove("active");
  gamepanel.classList.add("active");
});

socket.on("returntolobby", () => {
  gamepanel.classList.remove("active");
  lobbypanel.classList.add("active");
});
