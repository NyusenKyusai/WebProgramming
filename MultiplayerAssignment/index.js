"use strict";

const functions = require("./components/usefulFunctions.js");

const { application } = require("express");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Box2D = require("box2dweb-commonjs").Box2D;
const { count } = require("console");

app.use(express.static("public"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/assets", express.static(__dirname + "public/assets"));

let connections = [];
let rooms = [];
let counter = 0;

io.on("connection", (socket) => {
  if (rooms.length == 0) {
    counter++;

    rooms.push(functions.roomCreation(socket, "Room 1"));
  } else {
    counter = 0;

    for (let i = 0; i < rooms.length; i++) {
      counter++;

      if (rooms[i].length < 4) {
        rooms[i].push(functions.playerToRoom(socket, "Room " + i + 1));
        break;
      }

      if (i == rooms.length - 1) {
        rooms.push(functions.roomCreation(socket, "Room " + rooms.length));

        counter++;
        break;
      }
    }
  }

  console.log(socket.id + " connected to Room " + counter);

  connections.push({ socket: socket.id, nickname: "Anon" });
  io.sockets.emit("connectionlist", connections);
  //console.log(rooms);

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");

    let i = connections.findIndex((element) => element.socket == socket.id);

    //console.log(i);

    socket.broadcast.emit("usergone", connections[i].nickname);

    connections = connections.filter((element) => element.socket !== socket.id);

    io.sockets.emit("connection list", connections);

    if (rooms.length != 0) {
      for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i].findIndex((element) => element == socket.id);

        //console.log(r);

        if (r != -1) {
          rooms[i] = rooms[i].filter((element) => element !== socket.id);
        }
      }
    }

    //console.log(rooms);
  });

  socket.on("reguser", (nickname) => {
    let i = connections.findIndex((element) => element.socket == socket.id);
    connections[i].nickname = nickname;

    io.sockets.emit("connectionlist", connections);

    console.log(connections);
  });
});

server.listen(8000, function () {
  console.log("server up on *:8000");
});
