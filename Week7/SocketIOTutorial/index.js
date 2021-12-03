const { application } = require("express");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let connections = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "\\index.html");
});

io.on("connection", (socket) => {
  console.log("someone connected " + socket.id);

  connections.push({ socket: socket.id, nickname: "Anon" });

  io.sockets.emit("connectionlist", connections);

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");

    let i = connections.findIndex((element) => element.socket == socket.id);
    socket.broadcast.emit("usergone", connections[i].nickname);

    connections = connections.filter((element) => element.socket !== socket.id);

    io.sockets.emit("connection list", connections);
  });

  socket.on("reguser", (nickname) => {
    let i = connections.findIndex((element) => element.socket == socket.id);
    connections[i].nickname = nickname;

    socket.broadcast.emit("userregistered", nickname);

    io.sockets.emit("connectionlist", connections);
  });

  socket.on("chatmsg", (msg) => {
    let i = connections.findIndex((element) => element.socket == socket.id);
    let nickname = connections[i].nickname;

    socket.broadcast.emit("chatmsg", { nickname: nickname, msg: msg.msg });
  });

  socket.on("dmmsg", (msg) => {
    let i = connections.findIndex((element) => element.socket == socket.id);
    let nickname = connections[i].nickname;

    io.to(msg.sockid).emit("chatmsg", { nickname: nickname, msg: msg.msg });
  });

  socket.on("istyping", (msg) => {
    socket.broadcast.emit("istyping", socket.id);
  });

  socket.on("nottyping", (msg) => {
    socket.broadcast.emit("nottyping", socket.id);
  });
});

server.listen(8000, () => {
  console.log("listening on *:8000");
});
