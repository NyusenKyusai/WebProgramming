"use strict";

// Requiring the handler and gameLogic modules
const handlers = require("./components/eventHandlers.js");
const WebRacer = require("./components/gameLogic.js");
// Requiring the usefulFunctions module
const functions = require("./components/usefulFunctions.js");

// Requiring the Express, SocketIO, and Box2D modules from Node
const { application } = require("express");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Box2D = require("box2dweb-commonjs").Box2D;
const { count } = require("console");
// Requiring the useful function module again and the b2Vec2 from shortcuts
const usefulFunctions = require("./components/usefulFunctions.js");
const { b2Vec2 } = require("./components/shortcuts.js");

// Initialising Express to use the public file and it's sub files
app.use(express.static("public"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/assets", express.static(__dirname + "public/assets"));

// Initialising the connections, rooms, registered rooms arrays and the counter
let connections = [];
let rooms = [];
let regRooms = [];
let counter = 0;

// Calling the Box2DWeb class and sending in all the values
const mygame = new WebRacer.WebRacer(900, 1800, 30, 0, 0, 60, io);
// Getting the data and craeting the object
mygame.getData();

// Setting racer contact to the b2Listener
const racerContact = handlers.b2Listener;

// Calling PostSolve to handle collisions
racerContact.PostSolve = (contact, impulse) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();
};

// Calling the EndContact listener
racerContact.EndContact = (contact) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  // If statement that makes sure that bodies are a player and sensor
  if (fixA.id == "player" && fixB.id == "sensor") {
    // If fixture b is that start sensor
    if (fixB.uniquename == "start") {
      // Getting the linear velocity of the player in the x direction
      let xVelocity = contact.GetFixtureA().GetBody().GetLinearVelocity().x;

      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      // If the player ended contact with the start sensor while moving backwards
      if (xVelocity > 0) {
        // Sets the start flag to false
        mygame.player[index].moveObject.start = false;
      }
    }
  } else if (fixB.id == "player" && fixA.id == "sensor") {
    // If fixture a is that start sensor
    if (fixA.uniquename == "start") {
      // Getting the linear velocity of the player in the x direction
      let xVelocity = contact.GetFixtureB().GetBody().GetLinearVelocity().x;

      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      // If the player ended contact with the start sensor while moving backwards
      if (xVelocity > 0) {
        // Sets the start flag to false
        mygame.player[index].moveObject.start = false;
      }
    }
  }
};

// Calling the BeginContact listener
racerContact.BeginContact = (contact) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  // If statement that makes sure that bodies are a player and sensor
  if (fixA.id == "player" && fixB.id == "sensor") {
    // If fixture b is that start sensor
    if (fixB.uniquename == "start") {
      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      // Setting the start flag to true
      mygame.player[index].moveObject.start = true;

      //console.log(mygame.player[index].moveObject.start);
    }
    // If fixture b is that finish sensor
    if (fixB.uniquename == "finish") {
      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      // Setting the finish flag to true
      mygame.player[index].moveObject.finish = true;

      // If statement that determines whether the player has finished the race
      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        // Pushing the player to the podium
        mygame.podium.push(fixA.uniquename);

        // Setting the players finished flag to true
        mygame.player[index].moveObject.finished = true;
      }

      // console.log(mygame.player[index].moveObject.finish);
    }

    // If the sensor if powerup
    if (fixB.uniquename == "powerUp") {
      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      // If the player has no item
      if (!mygame.player[index].moveObject.item) {
        // Getting an item
        mygame.getItem(mygame.player[index]);
      }
    }
  } else if (fixB.id == "player" && fixA.id == "sensor") {
    // If fixture a is that start sensor
    if (fixA.uniquename == "start") {
      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      // Setting the finish flag to true
      mygame.player[index].moveObject.start = true;
    }
    if (fixA.uniquename == "finish") {
      // Getting the player using the uniquename
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      // Setting the finish flag to true
      mygame.player[index].moveObject.finish = true;

      // If statement that determines whether the player has finished the race
      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        // Pushing the player to the podium
        mygame.podium.push(fixB.uniquename);

        // Setting the players finished flag to true
        mygame.player[index].moveObject.finished = true;
      }
    }
  }
  // If the sensor if powerup
  if (fixA.uniquename == "powerUp") {
    // Getting the player using the uniquename
    let index = mygame.findPlayer(mygame.player, fixB.uniquename);

    // If the player has no item
    if (!mygame.player[index].moveObject.item) {
      // Getting an item
      mygame.getItem(mygame.player[index]);
    }
  }
};

// Setting the contact listener of the world object to racerContact
mygame.world.SetContactListener(racerContact);

// Socket IO that handles when a user has connected
io.on("connection", (socket) => {
  // If statement that handles when there is nothing in the rooms
  if (rooms.length == 0) {
    // Increasing the rooms counter
    counter++;

    // Pushing a room with a socket in the room, starting with room 1
    rooms.push(functions.roomCreation(socket, "Room 1"));
    // Creating an empty array into the registered rooms
    regRooms.push([]);
    // When the rooms array is not empty
  } else {
    // Setting the counter to 0
    counter = 0;

    // For loop to go through the rooms array
    for (let i = 0; i < rooms.length; i++) {
      // Increasing the counter
      counter++;

      // If length of a room in the rooms array is less than 4
      if (rooms[i].length < 4) {
        // Pushing a new person to the unfull room and breaking out of the for loop
        rooms[i].push(functions.playerToRoom(socket, "Room " + i + 1));
        break;
      }

      // If on the last iteration of the for loop
      if (i == rooms.length - 1) {
        // Creating a new room and passing in the person
        rooms.push(functions.roomCreation(socket, "Room " + rooms.length));
        // Pushing in a new registered rooms array
        regRooms.push([]);

        // Increasing the counter
        counter++;
        break;
      }
    }
  }

  // Pushing out which room they joined
  console.log(socket.id + " connected to Room " + counter);

  // Pushing in the socket id to the connection array with an anonymous nickname
  connections.push({ socket: socket.id, nickname: "Anon" });
  // Emitting the socket id to the connected player
  io.to(socket.id).emit("socketID", socket.id);
  // Sending all the players the connections array
  io.sockets.emit("connectionlist", connections);

  //console.log(connections);
  //console.log(rooms);

  // Handling disconnects
  socket.on("disconnect", () => {
    // Console logging which socket id disconnected
    console.log(socket.id + " disconnected");

    //console.log(i);

    // Filtering out the socket id from the connection array
    connections = connections.filter((element) => element.socket !== socket.id);

    // Emitting the new connections array
    io.sockets.emit("connectionlist", connections);

    // If statement to see if the rooms is empty
    if (rooms.length != 0) {
      // Finding where this disconnected player is
      let r = functions.findIndexRoom(rooms, socket.id);

      //console.log(r);
      //console.log(rooms);

      // Making sure that the player is in the rooms array
      if (r.r != -1) {
        // Filtering out the socket id from the array
        rooms[r.i] = rooms[r.i].filter((element) => element !== socket.id);
        // Sending the room the disconnected message and the new rooms array
        io.to("Room " + r.i + 1).emit("disconnected");
        io.to("Room " + r.i + 1).emit("rooms", rooms[r.i]);

        // Popping out a person from the registered array
        regRooms[r.i].pop();
        //console.log(regRooms);
      }

      // Sending all the players to the lobby
      io.to("Room " + r.i + 1).emit("returntolobby");
    }

    //console.log(rooms);
  });

  // Handling when a user has registered
  socket.on("reguser", (nickname) => {
    // Finding where on the connections list they are
    let i = functions.findIndex(connections, socket.id);
    // Setting the nickname of the array to the passed nickname
    connections[i].nickname = nickname;

    // Finding where in the rooms array they are
    let r = functions.findIndexRoom(rooms, socket.id);

    //console.log(r);

    // Emitting the new connections array
    io.sockets.emit("connectionlist", connections);

    // Emitting the registered message to the socket id
    io.to(socket.id).emit("registered");
    // Sending the rooms array to the room the socket id is a part of
    io.to("Room " + r.i + 1).emit("rooms", rooms[r.i]);

    // Pushing yes to the registered rooms
    regRooms[r.i].push("yes");

    // Telling the browsers the room is full once the length is 4
    if (regRooms[r.i].length === 4) {
      io.to("Room " + r.i + 1).emit("roomfull");
    }

    //console.log(regRooms);

    //console.log(connections);
  });

  // Handling the key down socket event
  socket.on("keydown", (key) => {
    // Finding the index in the rooms array using the socket id
    let index = usefulFunctions.findIndexRoom(rooms, socket.id);

    // console.log(index);

    // If the player is in room 1, then handling the key down event
    if (index.i == 0) {
      mygame.handleKeyDown(key, index.r);
    }
  });

  // Handling the key up event
  socket.on("keyup", (key) => {
    // Finding the index in the rooms array using the socket id
    let index = usefulFunctions.findIndexRoom(rooms, socket.id);

    // If the player is in room 1, then handling the key up event
    if (index.i == 0) {
      mygame.handleKeyUp(key, index.r);
    }
  });
});

server.listen(8000, function () {
  console.log("server up on *:8000");
});
