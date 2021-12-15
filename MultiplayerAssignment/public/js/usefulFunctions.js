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

const findIndexBitmap = (bitmapObjectArray, uniquename) => {
  let c = bitmapObjectArray.findIndex(
    (element) => element.uniquename == uniquename
  );

  return c;
};

const createShellBitmap = (
  bitmapObjectArray,
  dataObject,
  loader,
  bitFunction
) => {
  bitmapObjectArray.push({
    bitmap: bitFunction(
      loader.getResult("shell"),
      dataObject.objwidth,
      dataObject.objheight
    ),
    uniquename: dataObject.uniquename,
  });

  return findIndexBitmap(bitmapObjectArray, dataObject.uniquename);
};

const createSocketPlayersTable = (socket, players) => {
  let array = [];

  //console.log(players);

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

  return array;
};

const createPodiumHTML = (roomMembers, podium, connections) => {
  let outputHTML = "";

  let array = createSocketPlayersTable(roomMembers, podium);

  //console.log(array);

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

  return outputHTML;
};

const followPlayer = (initialised, animationComplete, x, y) => {
  if (!initialised && !animationComplete) {
    $("#easelcan").css({
      transform: "scale(0.7)",
      top: 0,
      left: 0,
    });

    initialised = true;

    $("#easelcan").animate(
      {
        left: -700,
        top: -380,
        easing: "swing",
      },
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

  if (animationComplete && initialised) {
    let zoomPadding = 0;
    let VP = Object.create({});
    VP.width = $("#viewport").width();
    VP.height = $("#viewport").height();
    VP.left = parseInt($("#easelcan").css("left"));
    VP.top = parseInt($("#easelcan").css("top"));

    let AW = Object.create({});
    AW.leftPad = 100;
    AW.topPad = 150;
    AW.rightPad = 300;
    AW.bottomPad = 200;

    let leftLimitMax = 1800 - VP.width - zoomPadding;
    let leftLimitMix = zoomPadding;

    let topLimitMax = 900 - VP.height - zoomPadding;
    let topLimitMin = zoomPadding;

    let leftPosition = 0;
    let topPosition = 0;

    if (x >= VP.left + (VP.width - AW.rightPad)) {
      leftPosition = x + AW.rightPad - VP.width;
    } else if (x <= -VP.left + AW.leftPad) {
      leftPosition = x - AW.leftPad;
    } else {
      leftPosition = -VP.left;
    }

    if (leftPosition < leftLimitMix) leftPosition = leftLimitMix;
    if (leftPosition > leftLimitMax) leftPosition = leftLimitMax;

    $("#easelcan").css({ left: -leftPosition, transition: "left 34ms" });

    if (y >= VP.top + (VP.height - AW.bottomPad)) {
      topPosition = y + AW.bottomPad - VP.height;
    } else if (y <= -VP.top + AW.topPad) {
      topPosition = y - AW.topPad;
    } else {
      topPosition = -VP.top;
    }

    if (topPosition < topLimitMin) topPosition = topLimitMin;
    if (topPosition > topLimitMax) topPosition = topLimitMax;

    $("#easelcan").css({ top: -topPosition, transition: "left 34ms" });
  }
};

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
