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

// Method to find the index of the bitmap array using a uniquename
const findIndexBitmap = (bitmapObjectArray, uniquename) => {
  // Findind the index
  let c = bitmapObjectArray.findIndex(
    (element) => element.uniquename == uniquename
  );

  return c;
};

// Taking in the array, object, loader, and function to create a bitmap
// for the shell
const createShellBitmap = (
  bitmapObjectArray,
  dataObject,
  loader,
  bitFunction
) => {
  // Pushing the bitmap uniquename object to the bitmap array using the
  // makeBitmap function
  bitmapObjectArray.push({
    bitmap: bitFunction(
      loader.getResult("shell"),
      dataObject.objwidth,
      dataObject.objheight
    ),
    uniquename: dataObject.uniquename,
  });

  // Returning the index by calling the find index bitmap
  return findIndexBitmap(bitmapObjectArray, dataObject.uniquename);
};

// Creating an array with sockets using the podium player names
const createSocketPlayersTable = (socket, players) => {
  let array = [];

  //console.log(players);

  // For loop that converts players to sockets
  for (let i = 0; i < players.length; i++) {
    switch (players[i]) {
      case "player1":
        array.push(socket[0]);
        break;
      case "player2":
        array.push(socket[1]);
        break;
      case "player3":
        array.push(socket[2]);
        break;
      case "player4":
        array.push(socket[3]);
        break;
    }
  }

  //console.log(array);

  // Returning the array
  return array;
};

// Function to create the html that handles the podium
const createPodiumHTML = (roomMembers, podium, connections) => {
  let outputHTML = "";

  // Passing in the room array and the podium array
  let array = createSocketPlayersTable(roomMembers, podium);

  //console.log(array);

  // Using the new array to create list elements to be a part of the unordered list
  for (let i = 0; i < array.length; i++) {
    let r = findIndex(connections, array[i]);

    //console.log(r);

    outputHTML +=
      "<li id='" +
      array[i] +
      "'>" +
      (i + 1) +
      ": " +
      connections[r].nickname +
      "</li>";
  }

  // Returning the HTML
  return outputHTML;
};

// Method to handle reactive viewports and scripted viewports
const followPlayer = (initialised, animationComplete, x, y) => {
  // Handling the scripted viewport at the start
  if (!initialised && !animationComplete) {
    // Creating the scale for the canvas as well as the initial position
    $("#easelcan").css({
      transform: "scale(0.7)",
      top: 0,
      left: 0,
    });

    // Setting the initialised flag to true
    initialised = true;

    // Animating the viewport to go from the top canvas to zoom in
    $("#easelcan").animate(
      {
        // Ending up in -700 left and -380 top
        left: -700,
        top: -380,
        easing: "swing",
      },
      // Setting the duration to 2 seconds and changing the scale
      {
        duration: 2000,
        start: function () {
          $("#easelcan").css({
            transform: "scale(1)",
            transition: "transform 2000ms",
          });
        },
        complete: function () {},
      }
    );
  }

  // Handling the reactive viewport
  if (animationComplete && initialised) {
    // Creating the zoom padding and the viewport object
    let zoomPadding = 0;
    let VP = Object.create({});
    // Setting the width to the width of the viewport
    VP.width = $("#viewport").width();
    // Setting the height to the height of the viewport
    VP.height = $("#viewport").height();
    // Setting the left to the same left as easelcanvas
    VP.left = parseInt($("#easelcan").css("left"));
    // Setting the top to the same top as easelcanvas
    VP.top = parseInt($("#easelcan").css("top"));

    // Creating another object that handles the padding
    let AW = Object.create({});
    AW.leftPad = 100;
    AW.topPad = 150;
    AW.rightPad = 300;
    AW.bottomPad = 200;

    // Creating the left limit maximum and minimum
    let leftLimitMax = 1800 - VP.width - zoomPadding;
    let leftLimitMix = zoomPadding;

    // Creating the top limit maximum and minimum
    let topLimitMax = 900 - VP.height - zoomPadding;
    let topLimitMin = zoomPadding;

    // Setting the left and top position
    let leftPosition = 0;
    let topPosition = 0;

    // Handling the movement of the easel canvas in the x direction
    if (x >= VP.left + (VP.width - AW.rightPad)) {
      leftPosition = x + AW.rightPad - VP.width;
    } else if (x <= -VP.left + AW.leftPad) {
      leftPosition = x - AW.leftPad;
    } else {
      leftPosition = -VP.left;
    }

    // Setting the maximum and minimum is case the left position
    // are lower
    if (leftPosition < leftLimitMix) leftPosition = leftLimitMix;
    if (leftPosition > leftLimitMax) leftPosition = leftLimitMax;

    // Setting the transition for left
    $("#easelcan").css({ left: -leftPosition, transition: "left 34ms" });

    // Handling the movement of the easel canvas in the y direction
    if (y >= VP.top + (VP.height - AW.bottomPad)) {
      topPosition = y + AW.bottomPad - VP.height;
    } else if (y <= -VP.top + AW.topPad) {
      topPosition = y - AW.topPad;
    } else {
      topPosition = -VP.top;
    }

    // Setting the maximum and minimum is case the left position
    // are lower
    if (topPosition < topLimitMin) topPosition = topLimitMin;
    if (topPosition > topLimitMax) topPosition = topLimitMax;

    // Setting the transition for top
    $("#easelcan").css({ top: -topPosition, transition: "left 34ms" });
  }
};

// Exporting the functions
export {
  roomCreation,
  playerToRoom,
  findIndex,
  findIndexRoom,
  findIndexBitmap,
  createShellBitmap,
  createPodiumHTML,
  createSocketPlayersTable,
  followPlayer,
};
