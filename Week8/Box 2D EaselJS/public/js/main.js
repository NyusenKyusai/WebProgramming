"use strict";

let socket = io();
let divs = [];

socket.on("objdata", function (data) {
  console.log(data);
});
