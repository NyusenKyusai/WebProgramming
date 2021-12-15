// Importing the shortcuts, the body creation classes, and the event handlers
const shortcut = require("./shortcuts.js");
const createLib = require("./classLib.js");
const handlers = require("./eventHandlers.js");
const data = require("./gameData.json");
const { b2Vec2 } = require("./shortcuts.js");

// Game class that has main reusable functions
class Game {
  // Initialising the variables that will be used
  height;
  width;
  scale;
  gravity;
  framerate;
  b2dcanvas;
  document;
  b2dctx;
  world;
  spawningTimer = true;
  // Setting boolean variables that act as flags
  // This boolean used for new levels
  gameStart = true;
  // Boolean for making sure collisions affect the impulse of player getting hit
  allowMove = true;
  // Invisibility frames for when a player get hurt
  invisible = false;
  // Array that holds the static objects
  collisionList = ["wall", "sensor"];
  // Current level
  currentLevel = 1;
  // Array that holds all the bodies in the world
  itemList = [];
  // Array of bodies that are meant to be destroyed
  destroylist = [];
  // Array that holds all the keyboard handlers
  keyboardHandler = [];
  // Array that holds all the keyboard handlers
  mouseHandler = [];
  io;

  // Constructor that takes the necessary variables for the game
  constructor(height, width, scale, gx, gy, framerate, io) {
    // Setting the variables to the constructor variables
    this.height = height;
    this.width = width;
    this.scale = scale;
    // Setting the gravity to the box2d vector using the delta x and delta y
    this.gravity = new shortcut.b2Vec2(gx, gy);
    // Setting the framerate
    this.framerate = framerate;
    // Creating the world with it's gravity
    this.world = new shortcut.b2World(this.gravity, true);

    this.io = io;
  }

  // Update function to draw the sprites
  update = () => {
    // Setting up the framerate of the world
    this.world.Step(1 / this.framerate, 10, 10);
    // Calling the game logic function
    this.gameLogic();
    this.world.ClearForces();
    // Not allowing the bodies to fall asleep
    // Otherwise the player object does not respond to key events
    this.world.m_allowSleep = false;
    // Calling the destroyList function to delete all the objects
    this.destroyList();

    this.io.emit("objectData", this.drawDOMObjects());
  };

  drawDOMObjects = () => {};

  gameLogic = () => {};

  // Add item funciton that pushes the body to the item list array
  addItem = (item) => {
    // Takes the item and pushes it into the item list array
    this.itemList.push(item);
    // If statement to stop the player from falling asleep
    if (item.userdata.id === "sensor") {
      //console.log(item.userdata.uniquename);
      item.GetBody().GetFixtureList().m_isSensor = true;
      //console.log(item.GetBody().GetFixtureList().IsSensor());
    }
  };

  // Destroy list method
  destroyList = () => {
    // For loop through loop through the destroylist array
    for (let i in this.destroylist) {
      // Destroying the body from the world
      this.world.DestroyBody(this.destroylist[i]);
    }
    // Setting the length of the array to zero
    this.destroylist.length = 0;
  };

  // getData function that uses XMLHTTPRequest to grab the body information from the json and create the bodies
  // takes in the level the game starts with and the location of the json
  getData = () => {
    let gamedata = data;

    // Parsing the http request into json
    //let gamedata = JSON.parse(string);

    // Taking the gamedata json and running code for each entry using a foreach loop and passing the item
    gamedata.forEach((item) => {
      // Switch case that calls the defineBody according to the type of the body in the json
      switch (item.type) {
        // When the body is a static object
        case "static":
          // Calling the add item method to add a new body to the item list
          this.addItem(
            // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
            new createLib.defineSB(...item.objdata, this.scale, this.world),
            // Sending the type to the add item method
            item.type
          );
          break;
        // When the body is a dynamic object
        case "dynamic":
          // Calling the add item method to add a new body to the item list
          this.addItem(
            // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
            new createLib.defineDB(...item.objdata, this.scale, this.world),
            // Sending the type to the add item method
            item.type
          );
          break;
        // In case the item in the json is incorrect
        default:
          console.log("Item type not recognised");
      }
      // If the userdata is an object
      if (typeof item.userdata == "object") {
        // For loop through the user data object
        for (let key in item.userdata) {
          // Adding the userdata to the itemlist entry using the key
          this.itemList[this.itemList.length - 1].changeUserData(
            key,
            item.userdata[key]
          );
        }
      }
    });
    gamedata.length = 0;
    // If this is the start of the game, it calls the update function to initialise it
    if (this.gameStart) {
      //console.log("first?");
      this.init();

      // this.itemList.forEach((item) => {
      //   console.log(item.GetBody().GetPosition());
      //   //console.log("\n");
      // });

      // Sets gameStart to false
      this.gameStart = false;
    }
  };

  // Method to call the keyboard handler class and pushing the result to the keyboardHandler array
  addKeyboardHandler(type, runFunction) {
    // Pushing the event listener to the array
    this.keyboardHandler.push(new handlers.keyboardHandler(type, runFunction));
  }

  // Method to call the mouse handler class and pushing the result to the mouseHandler array
  addMouseHandler(mousectx, type, runFunction) {
    // Pushing the event listener to the array
    this.mouseHandler.push(
      new handlers.mouseHandler(mousectx, type, runFunction)
    );
  }

  handleKeyDown = (e) => {
    console.log(e);
  };

  handleKeyUp = (e) => {
    console.log(e);
  };

  init = () => {};
}

// Class that extends the main class and adds logic to make the game specific to Legend of Zelda
class WebRacer extends Game {
  player = [];
  podium = [];
  max = 5;
  min = 1;
  interval;

  init = () => {
    this.player = this.getPlayer();

    this.interval = setInterval(() => {
      this.update();
    }, 1000 / this.framerate);

    this.update();
  };

  // Method that handles enemy movement
  gameLogic = () => {
    this.player.forEach((player) => {
      this.move(player);

      let x = player.player.GetBody().GetLinearVelocity().x;
      let y = player.player.GetBody().GetLinearVelocity().y;

      x -= x * 0.02;
      y -= y * 0.02;

      player.player.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));

      //console.log(player.GetBody().GetLinearVelocity());
    });
    //console.log(player[0].GetBody().GetAngle());
    //console.log(Math.tan(Math.PI));
    //console.log(this.podium);
    if (this.podium.length == 3) {
      this.io.emit("racefinished", this.podium);

      this.podium = [];
    }
  };

  // Method to get the body in the item list that is the player
  getPlayer = () => {
    // Initialise the player variable
    let player = [];

    //console.log(this.itemList);
    //console.log(this.itemList.length);

    // For each loop over the item list
    for (let i = 0; i < this.itemList.length; i++) {
      let moveObject = {
        left: false,
        right: false,
        accel: false,
        reverse: false,
        shoot: false,
        start: false,
        finish: false,
        finished: false,
        topSpeed: 7,
      };

      if (this.itemList[i].userdata.id === "player") {
        // Setting the player to the item
        player.push({
          player: this.itemList[i],
          moveObject: moveObject,
          item: null,
          start: false,
          finish: false,
        });
      }
    }

    // Returning the player variable
    return player;
  };

  drawDOMObjects = () => {
    let ret = [];

    for (let b = this.world.GetBodyList(); b; b = b.GetNext()) {
      for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
        let objectdata = this.getObjectInfo(f);

        ret.push({
          id: objectdata.id,
          uniquename: objectdata.uniquename,
          x: objectdata.x,
          y: objectdata.y,
          r: objectdata.r,
          objwidth: objectdata.objwidth,
          objheight: objectdata.objheight,
        });
      }
    }

    return ret;
  };

  getObjectInfo = (fixture) => {
    let id = fixture.GetBody().GetUserData().id;
    let uniquename = fixture.GetBody().GetUserData().uniquename;
    let x = Math.round(fixture.GetBody().GetPosition().x * this.scale);
    let y = Math.round(fixture.GetBody().GetPosition().y * this.scale);
    let r = Math.round(fixture.GetBody().GetAngle() * 100) / 100;
    let objwidth = Math.round(fixture.GetBody().GetUserData().width);
    let objheight = Math.round(fixture.GetBody().GetUserData().height);

    let object = {
      id: id,
      uniquename: uniquename,
      x: x,
      y: y,
      r: r,
      objwidth: objwidth,
      objheight: objheight,
    };

    return object;
  };

  // Method that takes the key code and determines the linear velocity of depending on the keycode
  move = (player) => {
    //console.log(object);
    // If the keycode is left and allowMove is true
    if (player.moveObject.left && !player.moveObject.finished) {
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      this.setAngularVelocity(player.player, -2);
      // If the keycode is right and allowMove is true
    }

    if (player.moveObject.right && !player.moveObject.finished) {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      this.setAngularVelocity(player.player, 2);
      // If the keycode is space bar and allowMove is true
    }

    if (player.moveObject.accel && !player.moveObject.finished) {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      this.applyImpulse(player.player, 1, player.moveObject.topSpeed);
      //console.log(player.moveObject.topSpeed);
    }

    if (player.moveObject.reverse && !player.moveObject.finished) {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      this.applyImpulse(player.player, -1, player.moveObject.topSpeed);
    }
  };

  // Method to get the linear velocity in the x direction
  getLinearX = (body) => {
    // Takes the body variable that was passed to the method and returning the linear velocity in the x direction
    return body.GetBody().GetLinearVelocity().x;
  };

  // Method to get the linear velocity in the y direction
  getLinearY = (body) => {
    // Takes the body variable that was passed to the method and returning the linear velocity in the y direction
    return body.GetBody().GetLinearVelocity().y;
  };

  getDirection = (angle) => {
    let x = 0;
    let y = 0;

    x = Math.cos(angle) * -1;
    y = Math.sin(angle) * -1;

    return { x: x, y: y };
  };

  // Method to set the linear velocity by taking the body, the x and the y
  applyImpulse = (body, direction, topSpeed) => {
    let multiplier = this.getDirection(body.GetBody().GetAngle());

    // Creates a new b2Vector and sets the linear velocity of the body
    if (
      (body.GetBody().GetLinearVelocity().x < topSpeed ||
        body.GetBody().GetLinearVelocity().y < topSpeed) &&
      (body.GetBody().GetLinearVelocity().x > -1 * topSpeed ||
        body.GetBody().GetLinearVelocity().y > -1 * topSpeed)
    ) {
      body
        .GetBody()
        .ApplyImpulse(
          new shortcut.b2Vec2(
            (multiplier.x * direction) / topSpeed,
            (multiplier.y * direction) / topSpeed
          ),
          body.GetBody().GetWorldCenter()
        );
    }
  };

  // Method to set the linear velocity by taking the body, the x and the y
  setAngularVelocity = (body, value) => {
    // Creates a new b2Vector and sets the linear velocity of the body
    body.GetBody().SetAngularVelocity(value);
  };

  setLinearVelocity = (body, x, y) => {
    // Creates a new b2Vector and sets the linear velocity of the body
    body.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));
  };

  // Method to stop the player from moving
  stopMove = (player) => {
    //console.log("sup");

    if (!player.moveObject.left || !player.moveObject.right) {
      player.player.GetBody().SetAngularVelocity(0);
    }
  };

  // Method that calls the move method and sends in the keycode
  handleKeyDown = (key, index) => {
    let currentPlayer = this.player[index];

    //console.log(currentPlayer);
    // Calls the getPlayer method and setting it to a variable

    // If the keycode is left and allowMove is true
    if (key == "a") {
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      currentPlayer.moveObject.left = true;
      // If the keycode is right and allowMove is true
    } else if (key == "d") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.right = true;
      // If the keycode is space bar and allowMove is true
    } else if (key == "w") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.accel = true;
    } else if (key == "s") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.reverse = true;
    } else if (key == "Enter") {
      this.handlePowerUp(index);
    }
  };

  // Method that calls the stopMove method and sends in the keycode
  handleKeyUp = (key, index) => {
    let currentPlayer = this.player[index];

    // If the keycode is left and allowMove is true
    if (key == "a") {
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      currentPlayer.moveObject.left = false;
      this.stopMove(currentPlayer);
      // If the keycode is right and allowMove is true
    } else if (key == "d") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.right = false;
      this.stopMove(currentPlayer);
      // If the keycode is space bar and allowMove is true
    } else if (key == "w") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.accel = false;
    } else if (key == "s") {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      currentPlayer.moveObject.reverse = false;
    }
  };

  // Method to handle mouse down
  handlePowerUp = (index) => {
    let currentPlayer = this.player[index];

    if (currentPlayer.moveObject.item == "boost") {
      currentPlayer.moveObject.topSpeed = 2;

      this.io.sockets.emit("boost");

      currentPlayer.moveObject.item = false;
      this.createTimeout("boost", currentPlayer);
    } else if (currentPlayer.moveObject.item == "shell") {
      this.shootShell(currentPlayer);

      currentPlayer.moveObject.item = false;
    }
  };

  getShellPosition = (playerBody) => {
    let direction = this.getDirection(playerBody.GetBody().GetAngle());

    return {
      position: playerBody.GetBody().GetPosition(),
      direction: direction,
    };
  };

  shootShell = (player) => {
    let body = player.player;

    let shellPosition = this.getShellPosition(body);

    let density = 1.0;
    let friction = 0.5;
    let restitution = 0.2;
    let x =
      shellPosition.position.x * this.scale +
      shellPosition.direction.x * this.scale;
    let y =
      shellPosition.position.y * this.scale +
      shellPosition.direction.y * this.scale;
    let radius = 2.5;
    let objid = "shell";
    let uniquename = player.player.GetBody().GetUserData().uniquename + "Shell";

    let shell = new createLib.defineDCB(
      density,
      friction,
      restitution,
      x,
      y,
      radius,
      objid,
      uniquename,
      this.scale,
      this.world
    );

    //console.log(shell.GetBody().GetPosition());
    //console.log(body.GetBody().GetPosition());

    shell
      .GetBody()
      .ApplyImpulse(
        new shortcut.b2Vec2(
          shellPosition.direction.x / 8,
          shellPosition.direction.y / 8
        ),
        shell.GetBody().GetWorldCenter()
      );

    this.createTimeout("shell", shell);
  };

  createTimeout = (condition, player) => {
    switch (condition) {
      case "boost":
        setTimeout(function () {
          player.moveObject.topSpeed = 7;
        }, 1000);
        break;
      case "shell":
        setTimeout(() => {
          this.destroylist.push(player.GetBody());
        }, 6000);
        break;
    }
  };

  findIndex = (array, code) => {
    let c = array.findIndex((element) => element == code);

    return c;
  };

  findPlayer = (array, code) => {
    let c = array.findIndex(
      (element) => element.player.GetBody().GetUserData().uniquename == code
    );

    return c;
  };

  getItem = (player) => {
    let item = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;

    player.moveObject.item = item;

    if (player.moveObject.item == 1) {
      player.moveObject.item = "boost";
    } else {
      player.moveObject.item = "boost";
    }

    console.log(player.moveObject.item);
  };
}

module.exports = {
  WebRacer: WebRacer,
};
