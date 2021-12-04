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

const findIndexRoom = (array, sockid) => {
  let r;
  let i;

  for (i = 0; i < array.length; i++) {
    r = array[i].findIndex((element) => element == sockid);
    break;
  }

  return { r, i };
};

const findIndex = (array, sockid) => {
  let c = array.findIndex((element) => element.socket == sockid);

  return c;
};

export { roomCreation, playerToRoom, findIndex, findIndexRoom };
