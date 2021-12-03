"use strict";

let socket = io();
let regpanel = document.getElementById("regpanel");
let lobbypanel = document.getElementById("lobbypanel");
let gamepanel = document.getElementById("gamepanel");

regpanel.addEventListener("submit", (e) => {
  e.preventDefault();

  if (e.target.nickname.value) {
    let nickname = e.target.nickname.value;

    socket.emit("reguser", nickname);

    regpanel.classList.remove("active");
    lobbypanel.classList.add("active");
  }
});
