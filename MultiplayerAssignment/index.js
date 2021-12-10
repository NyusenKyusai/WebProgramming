"use strict";

const handlers = require("./components/eventHandlers.js");
const WebRacer = require("./components/gameLogic.js");

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
let regRooms = [];
let counter = 0;

// Calling the Box2DWeb class and setting it to a variable with on the b2dcan canvas
const mygame = new WebRacer.WebRacer(900, 1800, 30, 0, 0, 60, io);
// Getting the data and creating the world bodies for level 1
mygame.getData();

// Setting LoZ contact to the b2Listener
const racerContact = handlers.b2Listener;

// Calling PostSolve to handle collisions
racerContact.PostSolve = (contact, impulse) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();
};

racerContact.BeginContact = (contact) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  if (fixA.id == "player" && fixB.id == "sensor") {
    if (fixB.uniquename == "start") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      let condition = mygame.player[index].moveObject.start;

      if (condition) {
        mygame.player[index].moveObject.start = false;
      } else {
        mygame.player[index].moveObject.start = true;
      }

      //console.log(mygame.player[index].moveObject.start);
    }
    if (fixB.uniquename == "finish") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      let condition = mygame.player[index].moveObject.finish;

      if (condition) {
        mygame.player[index].moveObject.finish = false;
      } else {
        mygame.player[index].moveObject.finish = true;
      }

      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        mygame.podium.push(fixA.uniquename);
      }

      //console.log(mygame.player[index].moveObject.finish);
    }

    if (fixB.uniquename == "powerUp") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      if (!mygame.player[index].moveObject.item) {
        mygame.getItem(mygame.player[index]);
      }
    }
  } else if (fixB.id == "player" && fixA.id == "sensor") {
    if (fixA.uniquename == "start") {
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      let condition = mygame.player[index].moveObject.start;

      if (condition) {
        mygame.player[index].moveObject.start = false;
      } else {
        mygame.player[index].moveObject.start = true;
      }

      //console.log(mygame.player[index].moveObject.start);
    }
    if (fixA.uniquename == "finish") {
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      let condition = mygame.player[index].moveObject.finish;

      if (condition) {
        mygame.player[index].moveObject.finish = false;
      } else {
        mygame.player[index].moveObject.finish = true;
      }

      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        mygame.podium.push(fixB.uniquename);
      }

      //console.log(mygame.player[index].moveObject.finish);
    }
  }
  if (fixA.uniquename == "powerUp") {
    let index = mygame.findPlayer(mygame.player, fixA.uniquename);

    if (!mygame.player[index].moveObject.item) {
      mygame.getItem(mygame.player[index]);
    }
  }
};

// Setting the contact listener of the world object to LoZContact
mygame.world.SetContactListener(racerContact);

io.on("connection", (socket) => {
  if (rooms.length == 0) {
    counter++;

    rooms.push(functions.roomCreation(socket, "Room 1"));
    regRooms.push([]);
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
        regRooms.push([]);

        counter++;
        break;
      }
    }
  }

  console.log(socket.id + " connected to Room " + counter);

  connections.push({ socket: socket.id, nickname: "Anon" });
  io.sockets.emit("connectionlist", connections);

  console.log(connections);
  //console.log(rooms);

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");

    //console.log(i);

    connections = connections.filter((element) => element.socket !== socket.id);

    io.sockets.emit("connectionlist", connections);

    if (rooms.length != 0) {
      let r = functions.findIndexRoom(rooms, socket.id);

      //console.log(r);
      //console.log(rooms);

      if (r.r != -1) {
        rooms[r.i] = rooms[r.i].filter((element) => element !== socket.id);
        io.to("Room " + r.i + 1).emit("disconnected");
        io.to("Room " + r.i + 1).emit("rooms", rooms[r.i]);

        regRooms[r.i].pop();
        //console.log(regRooms);
      }

      io.to("Room " + r.i + 1).emit("returntolobby");
    }

    //console.log(rooms);
  });

  socket.on("reguser", (nickname) => {
    let i = functions.findIndex(connections, socket.id);
    connections[i].nickname = nickname;

    let r = functions.findIndexRoom(rooms, socket.id);

    //console.log(r);

    io.sockets.emit("connectionlist", connections);

    io.to(socket.id).emit("registered");
    io.to("Room " + r.i + 1).emit("rooms", rooms[r.i]);

    regRooms[r.i].push("yes");

    if (regRooms[r.i].length === 4) {
      io.to("Room " + r.i + 1).emit("roomfull");
    }

    //console.log(regRooms);

    //console.log(connections);
  });
});

server.listen(8000, function () {
  console.log("server up on *:8000");
});
