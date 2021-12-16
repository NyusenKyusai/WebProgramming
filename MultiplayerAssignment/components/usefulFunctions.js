// Function to create a room and let a socket join a room
const roomCreation = (socket, room) => {
  // Letting a socket joina room
  socket.join(room);

  // Creating a room array and pushing the socket.id to the room
  let roomArray = [];
  roomArray.push(socket.id);

  // Returning the room array
  return roomArray;
};

// Method to join the socket to a room without the need for the creation of a room
const playerToRoom = (socket, room) => {
  socket.join(room);
  // Returning the socket id
  return socket.id;
};

// Method to take the array and socket id and find which room and which person in that room
const findIndexRoom = (array, sockid) => {
  let r;
  let i;

  // For loop to find which room a user is in and which person in that room
  for (i = 0; i < array.length; i++) {
    r = array[i].findIndex((element) => element == sockid);
    if (r != -1) {
      // Breaking out of the for loop if the value was found
      break;
    }
  }

  // Returning the room index and room position
  return { r, i };
};

// Method to find the index of the connections array
const findIndex = (array, sockid) => {
  let c = array.findIndex((element) => element.socket == sockid);

  return c;
};

// Exporting the module the NodeJS way
module.exports = {
  roomCreation: roomCreation,
  playerToRoom: playerToRoom,
  findIndexRoom: findIndexRoom,
  findIndex: findIndex,
};
