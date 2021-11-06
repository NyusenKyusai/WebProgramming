const { application } = require("express");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "\\index.html");
});

io.on("connection", (socket) => {
  console.log("someone connected " + socket.id);
  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });
  socket.on("chatmsg", (msg) => {
    console.log("message from " + socket.id + ": " + msg);
    io.emit("chatmsg", msg);
  });
});

server.listen(8000, () => {
  console.log("listening on *:8000");
});
