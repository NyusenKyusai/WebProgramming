const roomCreation = (socket, room) => {
  socket.join(room);

  let roomArray = [];
  roomArray.push(socket.id);

  return roomArray;
};

const playerToRoom = (socket, room) => {
  socket.join(room);

  return socket.id;
};

module.exports = {
  roomCreation: roomCreation,
  playerToRoom: playerToRoom,
};
