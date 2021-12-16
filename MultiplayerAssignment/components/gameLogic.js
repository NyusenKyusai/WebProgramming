// Requiring the shortcuts, the body creation classes, and the event handlers, as well as the b2Vec2 and the json data
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
  // Variable that holds the io that is used for connection
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
    // Setting the passed in io to the global io
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
    // Emitting the object data to the clients every frame
    this.io.emit("objectData", this.drawDOMObjects());
  };

  // Function to draw the objects
  drawDOMObjects = () => {};

  gameLogic = () => {};

  // Add item function that pushes the body to the item list array
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

  // getData function that reads the JSON file directly, no need for XMLHTTPRequests
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

      // Function to initialise the game and call the update loop
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

// Class that extends the main class and adds logic to make the game specific to the racing game
class WebRacer extends Game {
  // Initialising values that are needed
  player = [];
  podium = [];
  max = 5;
  min = 1;
  interval;

  // Initialising game, setting the player array as well as creating an interval for the update function
  init = () => {
    // Creating the player array
    this.player = this.getPlayer();

    // Creating an interval for update
    this.interval = setInterval(() => {
      // Calling the update function
      this.update();
      // Calling it depending on the framerate
    }, 1000 / this.framerate);

    // Calling the update function for the first time
    this.update();
  };

  // Method that handles top down friction and win/lose conditions
  gameLogic = () => {
    // for each loop that applies the friction to each player
    this.player.forEach((player) => {
      // Handling player movement
      this.move(player);

      // Getting the linear velocity x and y
      let x = player.player.GetBody().GetLinearVelocity().x;
      let y = player.player.GetBody().GetLinearVelocity().y;

      // Decreasing the velocity by 20%
      x -= x * 0.02;
      y -= y * 0.02;

      // Setting the velocity to the new value
      player.player.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));

      //console.log(player.GetBody().GetLinearVelocity());
    });
    //console.log(player[0].GetBody().GetAngle());
    //console.log(Math.tan(Math.PI));
    //console.log(this.podium);

    // Handling the win condition of first, second, and third place
    if (this.podium.length == 3) {
      this.io.emit("racefinished", this.podium);

      // Setting the podium to length zero to not constantly emit
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
      // Creating an object that holds all the movement values
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

      // If the itemlist object is a player
      if (this.itemList[i].userdata.id === "player") {
        // Pushing the player into the player array with the start finish state, the move object, it's current item, and the body
        player.push({
          player: this.itemList[i],
          moveObject: moveObject,
          item: null,
          start: false,
          finish: false,
        });
      }
    }

    // Returning the player array
    return player;
  };

  // Method that gets the all the values and pushes the values into an array
  drawDOMObjects = () => {
    // Initialising the array
    let ret = [];

    // Nested for loop that goes through every body in the world and every fixture in each body
    for (let b = this.world.GetBodyList(); b; b = b.GetNext()) {
      for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
        // Calling the get object info and passing in the fixture
        let objectdata = this.getObjectInfo(f);

        // Pushing the value into the array
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

    // Returning the array
    return ret;
  };

  getObjectInfo = (fixture) => {
    // Getting the id and uniquename and creating variables to hold them
    let id = fixture.GetBody().GetUserData().id;
    let uniquename = fixture.GetBody().GetUserData().uniquename;
    // Creating an optimized version of the x, y, and angle
    let x = Math.round(fixture.GetBody().GetPosition().x * this.scale);
    let y = Math.round(fixture.GetBody().GetPosition().y * this.scale);
    let r = Math.round(fixture.GetBody().GetAngle() * 100) / 100;
    // Getting the width and height
    let objwidth = Math.round(fixture.GetBody().GetUserData().width);
    let objheight = Math.round(fixture.GetBody().GetUserData().height);

    // Creating an object to hold all the values
    let object = {
      id: id,
      uniquename: uniquename,
      x: x,
      y: y,
      r: r,
      objwidth: objwidth,
      objheight: objheight,
    };

    // Returning the object
    return object;
  };

  // Method that takes the player object and applies impulses according to the booleans
  move = (player) => {
    //console.log(object);
    // If the object left is true and the racer has not passed the finish line
    if (player.moveObject.left && !player.moveObject.finished) {
      // Setting the angular velocity to turn the player
      this.setAngularVelocity(player.player, -2);
    }

    // If the object right is true and the racer has not passed the finish line
    if (player.moveObject.right && !player.moveObject.finished) {
      // Setting the angular velocity to turn the player
      this.setAngularVelocity(player.player, 2);
    }

    // If the object accelerate is true and the racer has not passed the finish line
    if (player.moveObject.accel && !player.moveObject.finished) {
      // Applying the impulse to the player in the positive direction using the current top speed
      this.applyImpulse(player.player, 1, player.moveObject.topSpeed);
    }

    // If the object reverse is true and the racer has not passed the finish line
    if (player.moveObject.reverse && !player.moveObject.finished) {
      // Applying the impulse to the player in the negative direction using the current top speed
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

  // Getting the correct magnitude of impulse in the x and y direction using the angle
  getDirection = (angle) => {
    let x = 0;
    let y = 0;

    // Getting the x and y using cosine and sine
    x = Math.cos(angle) * -1;
    y = Math.sin(angle) * -1;

    // Returning the values as an object
    return { x: x, y: y };
  };

  // Method to apply an impulse using the body, direction, and top speed
  applyImpulse = (body, direction, topSpeed) => {
    // Creating the x and y multipliers by passing the angle to the getDirection method
    let multiplier = this.getDirection(body.GetBody().GetAngle());

    // If statement to craete a maximum and minimum speed
    if (
      (body.GetBody().GetLinearVelocity().x < topSpeed ||
        body.GetBody().GetLinearVelocity().y < topSpeed) &&
      (body.GetBody().GetLinearVelocity().x > -1 * topSpeed ||
        body.GetBody().GetLinearVelocity().y > -1 * topSpeed)
    ) {
      // Applying an impulse to the body using the multiplier and the direction
      // The speed of the player is handled by dividing the vector by the topSpeed
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

  // Method to set the angular velocity by taking the body and the value
  setAngularVelocity = (body, value) => {
    // Creates the angular velocity
    body.GetBody().SetAngularVelocity(value);
  };

  // Method to set the linear velocity using the body, x and y
  setLinearVelocity = (body, x, y) => {
    // Creates a new b2Vector and sets the linear velocity of the body
    body.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));
  };

  // Method to stop the player from moving
  stopMove = (player) => {
    //console.log("sup");

    // Handles the stopping on angular velocity
    if (!player.moveObject.left || !player.moveObject.right) {
      player.player.GetBody().SetAngularVelocity(0);
    }
  };

  // Method that handles the move object of a specific player by key and index
  handleKeyDown = (key, index) => {
    // Getting the current player with the passed index
    let currentPlayer = this.player[index];

    //console.log(currentPlayer);
    // Calls the getPlayer method and setting it to a variable

    // If the keycode is left
    if (key == "a") {
      // Setting the moveobject left to true
      currentPlayer.moveObject.left = true;
      // If the keycode is right
    } else if (key == "d") {
      // Setting the moveobject right to true
      currentPlayer.moveObject.right = true;
      // If the keycode is accell
    } else if (key == "w") {
      // Setting the moveobject accel to true
      currentPlayer.moveObject.accel = true;
      // If the keycode is reverse
    } else if (key == "s") {
      // Setting the moveobject reverse to true
      currentPlayer.moveObject.reverse = true;
      // If the keycode is Enter
    } else if (key == "Enter") {
      // Calling the handlePowerUp and passing in the index
      this.handlePowerUp(index);
    }
  };

  // Method that calls the stopMove method with the key and index
  handleKeyUp = (key, index) => {
    // Getting the current player with the passed index
    let currentPlayer = this.player[index];

    // If the keycode is left
    if (key == "a") {
      // Setting the moveobject left to false
      currentPlayer.moveObject.left = false;
      // Calling stop move on the current player
      this.stopMove(currentPlayer);
      // If the keycode is right
    } else if (key == "d") {
      // Setting the moveobject right to false
      currentPlayer.moveObject.right = false;
      // Calling stop move on the current player
      this.stopMove(currentPlayer);
      // If the keycode is accel
    } else if (key == "w") {
      // Setting the moveobject accel to false
      currentPlayer.moveObject.accel = false;
      // If the keycode is reverse
    } else if (key == "s") {
      // Setting the moveobject reverse to false
      currentPlayer.moveObject.reverse = false;
    }
  };

  // Method to handle power ups using the index
  handlePowerUp = (index) => {
    // Getting the current player with the passed index
    let currentPlayer = this.player[index];

    // If statement for boost powerup and shell powerup
    if (currentPlayer.moveObject.item == "boost") {
      // Lowers the top speed divisor
      currentPlayer.moveObject.topSpeed = 2;

      // Emits the boost message to handle sound
      this.io.sockets.emit("boost");

      // Removes the players item
      currentPlayer.moveObject.item = false;
      // Creates a time out for when the boost runs out
      this.createTimeout("boost", currentPlayer);
      // If statement for shell
    } else if (currentPlayer.moveObject.item == "shell") {
      // Calles the shootShell method and passes the current player
      this.shootShell(currentPlayer);

      // Removes the players item
      currentPlayer.moveObject.item = false;
    }
  };

  // Method to determine where the shell should go and in which direction by getting the position of the player
  getShellPosition = (playerBody) => {
    // Getting the direction by passing the player's angle
    let direction = this.getDirection(playerBody.GetBody().GetAngle());

    // Returning the position and direction
    return {
      position: playerBody.GetBody().GetPosition(),
      direction: direction,
    };
  };

  // Method to create a shell body and launch it
  shootShell = (player) => {
    // Getting the body
    let body = player.player;

    // Getting the position of the shell
    let shellPosition = this.getShellPosition(body);

    // Creating the attributes for the object creation
    let density = 1.0;
    let friction = 0.5;
    let restitution = 0.2;
    // Setting x equal to the position of the player plus the direction of the shell
    let x =
      shellPosition.position.x * this.scale +
      shellPosition.direction.x * this.scale;
    // Setting y equal to the position of the player plus the direction of the shell
    let y =
      shellPosition.position.y * this.scale +
      shellPosition.direction.y * this.scale;
    let radius = 2.5;
    let objid = "shell";
    // Setting the unique ID to be the player name + Shell
    let uniquename = player.player.GetBody().GetUserData().uniquename + "Shell";

    // Calling the object creation module to create a circular object
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

    // Applying the impulse to the shell
    shell
      .GetBody()
      .ApplyImpulse(
        new shortcut.b2Vec2(
          shellPosition.direction.x / 8,
          shellPosition.direction.y / 8
        ),
        shell.GetBody().GetWorldCenter()
      );

    // Creating a timeout to destry the shell body
    this.createTimeout("shell", shell);
  };

  // Function to create the time out for the power ups
  createTimeout = (condition, player) => {
    // Switch case that handles boosts and shells
    switch (condition) {
      // If the case is boost, the top speed is returned to the original value after 1 second
      case "boost":
        setTimeout(function () {
          player.moveObject.topSpeed = 7;
        }, 1000);
        break;
      // If the case is shell, the body is destroyed after 6 seconds, in this case the player being the shell
      case "shell":
        setTimeout(() => {
          this.destroylist.push(player.GetBody());
        }, 6000);
        break;
    }
  };

  // Method to take in the array and a code and finding which index matches the code
  findIndex = (array, code) => {
    let c = array.findIndex((element) => element == code);

    return c;
  };

  // Method to take an array and a code and find the index that matches the player unique name
  findPlayer = (array, code) => {
    let c = array.findIndex(
      (element) => element.player.GetBody().GetUserData().uniquename == code
    );

    return c;
  };

  // If statement that determines which boost a player will get
  getItem = (player) => {
    // Function to randomly get whether the user receives a boost or a shell
    let item = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;

    // Setting the item to the moveobject item
    player.moveObject.item = item;

    // Setting both items to boost as easel js would not work with the shell creation process
    if (player.moveObject.item == 1) {
      player.moveObject.item = "boost";
    } else {
      player.moveObject.item = "boost";
    }

    console.log(player.moveObject.item);
  };
}

// Export module for NodeJS
module.exports = {
  WebRacer: WebRacer,
};
