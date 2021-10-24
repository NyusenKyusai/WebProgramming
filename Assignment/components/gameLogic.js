// Importing the shortcuts, the body creation classes, and the event handlers
import * as shortcut from "./shortcuts.js";
import { defineSB, defineDB } from "./classLib.js";
import * as handlers from "./eventHandlers.js";

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
  collisionList = ["wall", "ground", "sensor"];
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

  // Constructor that takes the necessary variables for the game
  constructor(height, width, scale, gx, gy, framerate, canvasname) {
    // Setting the variables to the constructor variables
    this.height = height;
    this.width = width;
    this.scale = scale;
    // Setting the gravity to the box2d vector using the delta x and delta y
    this.gravity = new shortcut.b2Vec2(gx, gy);
    // Setting the framerate
    this.framerate = framerate;
    // Getting the canvas in the html document and setting it to the variable
    this.b2dcanvas = document.getElementById(canvasname);
    // Setting the canvas context to the 2d
    this.b2dctx = this.b2dcanvas.getContext("2d");
    // Creating the world with it's gravity
    this.world = new shortcut.b2World(this.gravity, true);
  }

  // Method to create the debug draw
  setupDebugDraw = () => {
    // Setting the debug variable to the debug draw shortcut
    let debugDraw = new shortcut.b2DebugDraw();
    // Setting the sprite of the debug draw to the 2d context of the canvas
    debugDraw.SetSprite(this.b2dctx);
    // Setting the draw scale to the scale variable
    debugDraw.SetDrawScale(this.scale);
    // Setting the fill alpha to 0.3
    debugDraw.SetFillAlpha(0.3);
    // Setting the thickness of the lines
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(
      shortcut.b2DebugDraw.e_shapeBit | shortcut.b2DebugDraw.e_jointBit
    );
    // Setting the debug draw of the world to the variable just created with it's flags
    this.world.SetDebugDraw(debugDraw);
  };

  // Update function to draw the sprites
  update = () => {
    // Setting up the framerate of the world
    this.world.Step(1 / this.framerate, 10, 10);
    // Calling the game logic function
    this.gameLogic();
    this.world.DrawDebugData();
    this.world.ClearForces();
    // Not allowing the bodies to fall asleep
    // Otherwise the player object does not respond to key events
    this.world.m_allowSleep = false;
    // Calling the destroyList function to delete all the objects
    this.destroyList();
    // Animating the window and recalling the update function
    window.requestAnimationFrame(this.update);
  };

  gameLogic = () => {};

  // Add item funciton that pushes the body to the item list array
  addItem = (item, type) => {
    // Takes the item and pushes it into the item list array
    this.itemList.push(item);
    // If statement to stop the player from falling asleep
    if (item.userdata.id === "player") {
      // Setting the player sleep to false
      item.GetBody().allowSleep = false;

      //console.log(item.GetBody().allowSleep);
    }
    // If statement to stop dynamic players from rotating
    if (type == "dynamic") {
      // Setting angular damping to the highest value
      // Setting allow rotation to false does not work
      item.GetBody().SetAngularDamping(100000000000);
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
  getData = (datasource, level, json) => {
    this.currentLevel = level;
    // Setting the XHR variable to the http request class
    let XHR = new XMLHttpRequest();
    // setting the onreadystatechange to callback function that creates the bodies
    XHR.onreadystatechange = () => {
      // If statement that runs the lines of code when the http request actually gets the json file
      if (XHR.readyState == 4 && XHR.status == 200) {
        // Parsing the http request into json
        let gamedata = JSON.parse(XHR.responseText);

        // Taking the gamedata json and running code for each entry using a foreach loop and passing the item
        gamedata.forEach((item) => {
          // If statement to add bodies to the world depending on what level the player is in
          if (
            (item.level == level || item.level == 0) &&
            !json["level" + this.currentLevel].array.includes(item.objdata[8])
          ) {
            // Switch case that calls the defineBody according to the type of the body in the json
            switch (item.type) {
              // When the body is a static object
              case "static":
                // Calling the add item method to add a new body to the item list
                this.addItem(
                  // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
                  new defineSB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
                  // Sending the type to the add item method
                  item.type
                );
                break;
              // When the body is a dynamic object
              case "dynamic":
                // Calling the add item method to add a new body to the item list
                this.addItem(
                  // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
                  new defineDB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
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
          }
        });
        gamedata.length = 0;
        // If this is the start of the game, it calls the update function to initialise it
        if (this.gameStart) {
          console.log("first?");
          this.update();
          // Sets gameStart to false
          this.gameStart = false;
        }
      }
    };
    // Opening the GET to the json and getting information
    XHR.open("GET", datasource, true);
    // Sending the XHR
    XHR.send();
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

  // Function to increase the level
  increaseLevel = () => {
    this.currentLevel++;
  };
}

// Class that extends the main class and adds logic to make the game specific to Legend of Zelda
class LoZGame extends Game {
  allowJump = true;
  // Timer for slime movement
  slimeTimer = true;
  // Attacking flag
  attacking;
  // Enemy array
  enemyArray = [];
  // Time out for attacking/ Attempted to clear timeout whenever the user attacked again but it did not work
  attackTiming;

  // Method to add bodies to the world using getData method when the player changes level
  spawn = (uniquename, json) => {
    // Sets the itemlist to an empty array
    this.itemList = [];
    // Switch case that takes the sensor unique name and passes the level to the get data method
    switch (uniquename) {
      case "sensor1":
        this.getData("./components/gameData.json", 2, json);
        break;
      case "sensor2":
        this.getData("./components/gameData.json", 1, json);
        break;
      case "sensor3":
        this.getData("./components/gameData.json", 3, json);
        break;
      case "sensor4":
        this.getData("./components/gameData.json", 2, json);
        break;
    }
  };

  // Method to create and return the bodies from the item list that are enemies
  getEnemy = () => {
    let enemyArray = [];

    // For loop that iterates through the item list
    for (let item in this.itemList) {
      // If statement that pushes the item to the enemy array if it is an enemy
      if (
        this.itemList[item].userdata.id == "orc" ||
        this.itemList[item].userdata.id == "slime" ||
        this.itemList[item].userdata.id == "boss"
      ) {
        enemyArray.push(this.itemList[item]);

        //console.log(item);
      }
    }

    // Returns the array
    return enemyArray;
  };

  // Method to get the distance of one object to another in the canvas
  getDistance = (player, enemy) => {
    // Calculates the distance using the world center's x coordinate
    let distance =
      player.GetBody().GetWorldCenter().x - enemy.GetBody().GetWorldCenter().x;
    // Returns the distance
    return distance;
  };

  // Method to determine what direction the AI needs to move to get closer to the player
  getDirection = (distance) => {
    // Initialising the variable
    let direction = 0;
    // If the distance is larger than 0
    if (distance > 1) {
      // The direction is positive
      direction = 1;
      // If the distance is negative
    } else if (distance < -1) {
      // The direction is negative
      direction = -1;
    }
    // Returning the direction
    return direction;
  };

  // Method to apply impulse to a fixture using the direction, and the forces in the x and y
  applyImpulse = (direction, fixture, x, y) => {
    // Gets a fixture's body and applies an impulse to it
    fixture.GetBody().ApplyImpulse(
      // Creates a new b2Vector and uses the direction to determine where in x it should be applied
      new shortcut.b2Vec2(x * direction, y),
      // Applying it to the world center of the fixture
      fixture.GetBody().GetWorldCenter()
    );
  };

  // Method takes in a body and a direction and applies different kinds of impulses depending of the type of enemy
  enemyMove = (enemy, direction) => {
    // Used to reorient the this keyword inside a interval function
    let self = this;
    // Switch case that uses the enemy id
    switch (enemy.userdata.id) {
      // If the case is an orc, it moves straight towards the player
      case "orc":
        // Calls the apply impulse function
        this.applyImpulse(direction, enemy, 3, 0);
        break;
      // If the enemy is a slime, it moves in jumps towards the player
      case "slime":
        // I tried setting a timer so that the slimes would have a cool down between jumps
        // The interval would not work correctly, and the objects would fly upwards infinitely
        // It was scrapped

        // if (this.slimeTimer == true) {
        this.applyImpulse(direction, enemy, 3, -10);

        //   this.slimeTimer = false;
        // }

        // setInterval(function () {
        //   self.slimeTimer = true;
        // }, 5000);

        break;
      // If the case is the boss, it moves like the orc
      case "boss":
        // Calls the apply impulse function
        this.applyImpulse(direction, enemy, 3, 0);
        break;
    }
  };

  // Method that handles enemy movement
  gameLogic = () => {
    // Getting the body from the item list that is the player
    let player = this.getPlayer();
    // Setting the enemyArray by calling the getEnemy method
    this.enemyArray = this.getEnemy();
    // For loop through the enemyArray
    for (let enemy in this.enemyArray) {
      // Getting the distance from the player and the enemy by calling the distance method
      let distance = this.getDistance(player, this.enemyArray[enemy]);
      // Getting the direction by using the direction method
      let direction = this.getDirection(distance);
      // If statement that determines the direction of enemy movement
      if (direction == -1) {
        // LinerVelocity in x is never 0, so if it is lower than -1 and greater than 0
        if (
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x > -1 &&
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x <= 0
        ) {
          // Calls the enemyMove method
          this.enemyMove(this.enemyArray[enemy], direction);
        }
      } else if (direction == 1) {
        // LinerVelocity in x is never 0, so if it is lower than 1 and greater than 0
        if (
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x < 1 &&
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x >= 0
        ) {
          // Calls the enemyMove method
          this.enemyMove(this.enemyArray[enemy], direction);
        }
      }

      // Direction is set to 0
      direction = 0;
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

  // Method to set the linear velocity by taking the body, the x and the y
  setLinearVelocity = (body, x, y) => {
    // Creates a new b2Vector and sets the linear velocity of the body
    body.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));
  };

  // Method to get the body in the item list that is the player
  getPlayer = () => {
    // Initialise the player variable
    let player;

    //console.log(this.itemList);
    //console.log(this.itemList.length);

    // For each loop over the item list
    this.itemList.forEach((item) => {
      // If statement to determine if the item is the player
      if (item.userdata.id === "player") {
        // Setting the player to the item
        player = item;
      }

      //console.log(item);
    });
    // Returning the player variable
    return player;
  };

  // Method to returning the invisible boolean
  getInvisible = () => {
    return this.invisible;
  };

  // Method to return the allow move boolean
  getAllowMove = () => {
    return this.allowMove;
  };

  // Method set the invisible boolean variable using a passed boolean
  setInvisible = (boolean) => {
    this.invisible = boolean;
  };

  // Method set the allow move boolean variable using a passed boolean
  setAllowMove = (boolean) => {
    this.allowMove = boolean;
  };

  // Method that takes the key code and determines the linear velocity of depending on the keycode
  move = (keyCode) => {
    // Calls the getPlayer method and setting it to a variable
    let player = this.getPlayer();

    // If the keycode is left and allowMove is true
    if (keyCode == 65 && this.allowMove) {
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      this.setLinearVelocity(player, -4, this.getLinearY(player));
      // If the keycode is right and allowMove is true
    } else if (keyCode == 68 && this.allowMove) {
      // Setting the linear velocity of player to going right while keeping the linear velocity in the y direction
      this.setLinearVelocity(player, 4, this.getLinearY(player));
      // If the keycode is space bar and allowMove is true
    } else if (keyCode == 32 && this.allowMove) {
      if (this.allowJump) {
        this.allowJump = false;
        // Setting the linear velocity of player to going up while keeping the linear velocity in the x direction
        this.setLinearVelocity(player, this.getLinearX(player), -5);
      }
    }
  };

  // Method to stop the player from moving
  stopMove = (keyCode) => {
    // Get the player
    let player = this.getPlayer();
    // If the keycode is a or d on key up
    if (keyCode == 65 || keyCode == 68) {
      // The player body that sets the linear velocity
      player.GetBody().SetLinearVelocity(
        // Creates a new b2Vector and sets the x to zero while getting the y linear velocity
        new shortcut.b2Vec2(0, player.GetBody().GetLinearVelocity().y)
      );
    }
  };

  // Method that calls the move method and sends in the keycode
  handleKeyDown = (e) => {
    // Calls the move method
    this.move(e.keyCode);
  };

  // Method that calls the stopMove method and sends in the keycode
  handleKeyUp = (e) => {
    // Calls the stopMove method
    this.stopMove(e.keyCode);
  };

  // Method that handles the attacking flag and calls a timeout
  attack = () => {
    // Sets attacking to true
    this.attacking = true;
    // Sets attack timing to a time out that triggers after 1 sec
    this.attackTiming = setTimeout(() => {
      // Sets attacking to false
      this.attacking = false;
    }, 1000);
  };

  // Method to handle mouse down
  handleMouseDown = () => {
    // Calls the attack method
    this.attack();
  };

  changeJSONObject = (json, uniquename) => {
    switch (this.currentLevel) {
      case 1:
        json.level1.array.push(uniquename);
        json.level1.kills += 1;
        break;
      case 2:
        json.level2.array.push(uniquename);
        json.level2.kills += 1;
        break;
      case 3:
        json.level3.array.push(uniquename);
        json.level3.kills += 1;
        break;
    }

    return json;
  };
}

// Class that extends the Box2D class and adds to easeljs to it
class EaselGame extends LoZGame {
  // Creates Easel variables
  easelCan;
  easelCTX;
  // Loader variable
  loader;
  stage;
  stageHeight;
  stageWidth;
  easelBackground;
  easelPlayer;
  easelEnemies = [];
  attacking;
  destroylistEnemy = [];
  enemyArray = [];
  attackTiming;
  allowJump = true;
  // Spritesheet variables
  playerSpritesheet;
  orcSpritesheet;
  slimeSpritesheet;
  bossSpritesheet;

  // Manifest that holds the src and the id to be used in the loadqueue
  manifest = [
    // Background png
    { src: "background.png", id: "background" },
    // Orc png
    { src: "orc.png", id: "orc" },
    // Slime png
    { src: "slime.png", id: "slime" },
    // Boss png
    { src: "boss.png", id: "boss" },
    // Player png
    { src: "spritesheet_player.png", id: "player" },
  ];

  // Constructor for the EaselJS class
  constructor(height, width, scale, gx, gy, framerate, canvasname) {
    // Calling the variable assignment of the parent class
    super(height, width, scale, gx, gy, framerate, canvasname);
    // Setting the easelCan variable to the DOM canvas
    this.easelCan = document.getElementById(canvasname);
    // Setting the easelCTX to the easelCan context
    this.easelCTX = this.easelCan.getContext("2d");
    // Setting the stage to a EaselJS stage using the canvas
    this.stage = new createjs.Stage(this.easelCan);
    // Setting snapping to pixels to true
    this.stage.snapPixelsEnabled = true;
    // Setting the stage canvas width and height to the passed stageWidth
    this.stageWidth = this.stage.canvas.width;
    this.stageHeight = this.stage.canvas.height;
    // Calling the loader and setting it to the LoadQueue
    this.loader = new createjs.LoadQueue(false);
    // Adding and event listener that runs handleComplete when the loader is complete
    this.loader.addEventListener("complete", this.handleComplete);
    // Loading the manifest of the loader passing the manifest and the path
    this.loader.loadManifest(this.manifest, true, "./assets/easel/");
  }

  // Taking the update function and changing how to it behaves to easeljs
  update = () => {
    // Setting up the framerate of the world
    this.world.Step(1 / this.framerate, 10, 10);
    // Calling the game logic function
    this.gameLogic();
    this.world.DrawDebugData();
    this.world.ClearForces();
    // Not allowing the bodies to fall asleep
    // Otherwise the player object does not respond to key events
    this.world.m_allowSleep = false;
    // Calling the destroyList function to delete all the objects
    this.destroyList();
    // Calling the destroyListEnemy function to delete enemies as well as removing them from the easel stage
    this.destroyListEnemy();
    // Setting the player to the getPlayer method
    let player = this.getPlayer();
    // Updating the easelPlayer position to follow the player box2d object position
    this.easelPlayer.x = player.GetBody().GetPosition().x * this.scale;
    this.easelPlayer.y = player.GetBody().GetPosition().y * this.scale;
    // Setting the enemyarray using the getEnemy method
    this.enemyArray = this.getEnemy();

    //console.log(this.enemyArray);
    // Updating the easelEnemy array using the enemyArray
    for (let enemy in this.enemyArray) {
      // Setting the easelEnemy to the enemyArray x position
      this.easelEnemies[enemy].x =
        this.enemyArray[enemy].GetBody().GetPosition().x * this.scale;
      // Setting the easelEnemy to the enemyArray y position
      this.easelEnemies[enemy].y =
        this.enemyArray[enemy].GetBody().GetPosition().y * this.scale;
    }
  };

  // Method to add bodies to the world using getData method when the player changes level
  spawn = (uniquename) => {
    // Switch case that takes the sensor unique name and passes the level to the get data method
    switch (uniquename) {
      case "sensor1":
        this.getData("./components/gameData.json", 2);
        break;
      case "sensor2":
        this.getData("./components/gameData.json", 1);
        break;
      case "sensor3":
        this.getData("./components/gameData.json", 3);
        break;
      case "sensor4":
        this.getData("./components/gameData.json", 2);
        break;
    }
    // Calls handleComplete in an attempt to handle moving between levels
    this.handleComplete();
  };

  // Method that handles the deletion of the enemy as well as the removal from the stage
  destroyListEnemy = () => {
    // Getting the enemy array using the getEnemy method
    this.enemyArray = this.getEnemy();
    // Nested for loop that handles the enemyArray and finding the element in the destroy list so that the correct easelEnemy is deleted
    for (let destroy in this.destroylistEnemy) {
      for (let enemy in this.enemyArray) {
        // If statement that handles finding the correct index using the uniquename
        if (
          this.enemyArray[enemy].userdata.uniquename ==
          this.destroylistEnemy[destroy].GetUserData().uniquename
        ) {
          //console.log(this.destroylistEnemy[destroy].GetUserData());
          // Destroying the body
          this.world.DestroyBody(this.destroylistEnemy[destroy]);
          // Removing the bitmap from the stage using the index from the easelEnemy
          this.stage.removeChild(this.easelEnemies[enemy]);
        }
      }
    }
    // Setting the length of the destroylist to 0
    this.destroylist.length = 0;
  };

  // getData function that uses XMLHTTPRequest to grab the body information from the json and create the bodies
  // takes in the level the game starts with and the location of the json
  getData = (datasource, level) => {
    // Setting the XHR variable to the http request class
    let XHR = new XMLHttpRequest();
    // setting the onreadystatechange to callback function that creates the bodies
    XHR.onreadystatechange = () => {
      // If statement that runs the lines of code when the http request actually gets the json file
      if (XHR.readyState == 4 && XHR.status == 200) {
        // Parsing the http request into json
        let gamedata = JSON.parse(XHR.responseText);
        // Taking the gamedata json and running code for each entry using a foreach loop and passing the item
        gamedata.forEach((item) => {
          // If statement to add bodies to the world depending on what level the player is in
          if (item.level == level || item.level == 0) {
            // Switch case that calls the defineBody according to the type of the body in the json
            switch (item.type) {
              // When the body is a static object
              case "static":
                // Calling the add item method to add a new body to the item list
                this.addItem(
                  // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
                  new defineSB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
                  // Sending the type to the add item method
                  item.type
                );
                break;
              // When the body is a dynamic object
              case "dynamic":
                // Calling the add item method to add a new body to the item list
                this.addItem(
                  // Calling the class and adding the objdata from the json as well as the scale, world, and the level of the body
                  new defineDB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
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

                //console.log(item.userdata);
              }
            }
          }
        });
      }
    };
    // Opening the GET to the json and getting information
    XHR.open("GET", datasource, true);
    // Sending the XHR
    XHR.send();
  };

  // Method that handles the update and the stage update in one method to be passed to the Ticker for EaselJS
  tick = (e) => {
    this.update();
    this.stage.update(e);
  };

  handleComplete = () => {
    //prettier-ignore
    this.playerSpritesheet = new createjs.SpriteSheet({
      "framerate": 60,
      "images": [this.loader.getResult("player")],
      "frames": [
        [1, 1, 23, 32, 0, 11.5, 32],
        [1, 35, 17, 32, 0, 8.5, 32],
        [1, 69, 32, 30, 0, 16, 30],
        [20, 35, 16, 32, 0, 8, 32],
        [26, 1, 16, 32, 0, 8, 32],
        [35, 69, 16, 31, 0, 8, 31],
      ],
      "animations": {
        "stand": { "frames": [5] },
        "run": { "frames": [1, 5, 3, 4], "speed": 0.25 },
        "attack": { "frames": [0, 2], "speed": 0.05 },
      },
      "texturepacker": [
        "SmartUpdateHash: $TexturePacker:SmartUpdate:17baabe56ed864e1274376ba31c68dfa:75aee0be487f804f29cae7954f09ab6b:5fca50be405cbd4bd273a8b2f02a084c$",
        "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
      ],
    });
    //prettier-ignore
    this.orcSpritesheet = new createjs.SpriteSheet({
      "framerate": 20,
      "images": [this.loader.getResult("orc")],
      "frames": [[1, 1, 83, 131, 0, 42, 131]],
      "animations": {
        "orc": { "frames": [0] },
      },
      "texturepacker": [
        "SmartUpdateHash: $TexturePacker:SmartUpdate:501c1b0c1f3f971482355c9c3bd641a9:9b238b59ac5ed5233bae41ba00a09fea:8d2f034a042f5e42d835b3511e9c1732$",
        "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
      ],
    });
    //prettier-ignore
    this.slimeSpritesheet = new createjs.SpriteSheet({
      "framerate": 20,
      "images": [this.loader.getResult("slime")],
      "frames": [[1, 1, 18, 14, 0, 9, 14]],
      "animations": {
        "slime": { "frames": [0] },
      },
      "texturepacker": [
        "SmartUpdateHash: $TexturePacker:SmartUpdate:913e1b47e1f7640b11d314cf41a74cc3:8d759e34bfe2cdfff75e3cfbdb7725b3:5969a7bd39dc609f49b3bb3f3e71107a$",
        "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
      ],
    });
    //prettier-ignore
    this.bossSpritesheet = new createjs.SpriteSheet({
      "framerate": 20,
      "images": [this.loader.getResult("boss")],
      "frames": [[1, 1, 16, 42, 0, 8, 42]],
      "animations": {
        "boss": { "frames": [0] },
      },
      "texturepacker": [
        "SmartUpdateHash: $TexturePacker:SmartUpdate:c20cfdc1ff0b508ce6316fdff18b22e2:e8473474efd48dadc9c8230c17880405:46ed12eff2905e238af2d2a3f055c310$",
        "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
      ],
    });

    this.easelBackground = this.makeBitmap(
      this.loader.getResult("background"),
      this.stageWidth,
      this.stageHeight
    );

    this.easelBackground.x = 0;
    this.easelBackground.y = 0;

    this.easelPlayer = new createjs.Sprite(
      this.getSpritesheet(this.getPlayer()),
      "stand"
    );
    this.easelPlayer.snapToPixel = true;

    this.stage.addChild(this.easelBackground, this.easelPlayer);

    this.enemyArray = this.getEnemy();

    for (let enemy in this.enemyArray) {
      this.easelEnemies.push(
        new createjs.Sprite(
          this.getSpritesheet(this.enemyArray[enemy]),
          this.enemyArray[enemy].GetBody().GetUserData().id
        )
      );
      this.easelEnemies[enemy].snapToPixel = true;

      this.stage.addChild(this.easelEnemies[enemy]);
    }

    //console.log(this.easelEnemies);

    createjs.Ticker.framerate = this.framerate;
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", this.tick);
  };

  // Method that calls the correct spritesheet according to the id of the body that is passed to it
  getSpritesheet = (box2DObject) => {
    // Variable that holds the correct spritesheet
    let easelObject;

    // Switch case using the id of the box2DObject
    switch (box2DObject.GetBody().GetUserData().id) {
      // Case where the object is player
      case "player":
        // Setting the easelObject to the Player spritesheet
        easelObject = this.playerSpritesheet;
        break;
      case "orc":
        // Setting the easelObject to the Orc spritesheet
        easelObject = this.orcSpritesheet;
        break;
      case "slime":
        // Setting the easelObject to the Slime spritesheet
        easelObject = this.slimeSpritesheet;
        break;
      case "boss":
        // Setting the easelObject to the Boss spritesheet
        easelObject = this.bossSpritesheet;
        break;
    }
    // Return easelObject
    return easelObject;
  };

  // Method that handles enemy movement
  gameLogic = () => {
    // Getting the body from the item list that is the player
    let player = this.getPlayer();
    // Setting the enemyArray by calling the getEnemy method
    this.enemyArray = this.getEnemy();
    // For loop through the enemyArray
    for (let enemy in this.enemyArray) {
      // Getting the distance from the player and the enemy by calling the distance method
      let distance = this.getDistance(player, this.enemyArray[enemy]);
      // Getting the direction by using the direction method
      let direction = this.getDirection(distance);
      // If statement that determines the direction of enemy movement
      if (direction == -1) {
        // LinerVelocity in x is never 0, so if it is lower than -1 and greater than 0
        if (
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x > -1 &&
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x <= 0
        ) {
          // Calls the enemyMove method
          this.enemyMove(this.enemyArray[enemy], direction);
        }
        // Changing the orientation in the x direction to face left
        this.easelEnemies[enemy].scaleX = -1;
      } else if (direction == 1) {
        // LinerVelocity in x is never 0, so if it is lower than 1 and greater than 0
        if (
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x < 1 &&
          this.enemyArray[enemy].GetBody().GetLinearVelocity().x >= 0
        ) {
          // Calls the enemyMove method
          this.enemyMove(this.enemyArray[enemy], direction);
        }
        // Changing the orientation in the x direction to face right
        this.easelEnemies[enemy].scaleX = 1;
      }
      // Direction is set to 0
      direction = 0;
    }
  };

  // Method to create the bitmap using the image and the regX and regY
  makeBitmap = (loaderImg, b2x, b2y) => {
    // Setting theImage variable to a Bitmap of the loaderimg
    let theImage = new createjs.Bitmap(loaderImg);
    // Setting the scale x and y of the image
    let scaleX = (b2x * 2) / theImage.image.naturalWidth;
    let scaleY = (b2y * 2) / theImage.image.naturalHeight;
    // Setting theImage scale to the variables previously created
    theImage.scaleX = scaleX;
    theImage.scaleY = scaleY;
    // Setting the regX and the regY
    theImage.regX = theImage.image.width / 2;
    theImage.regY = theImage.image.height / 2;
    // Returning the image
    return theImage;
  };

  // Method that takes the key code and determines the linear velocity of depending on the keycode
  move = (keyCode) => {
    // Calls the getPlayer method and setting it to a variable
    let player = this.getPlayer();
    // If the keycode is left and allowMove is true
    if (keyCode == 65 && this.allowMove) {
      // Playing the player run animation and making the player face the correct direction
      this.easelPlayer.gotoAndPlay("run");
      this.easelPlayer.scaleX = -1;
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      this.setLinearVelocity(player, -4, this.getLinearY(player));
      // If the keycode is right and allowMove is true
    } else if (keyCode == 68 && this.allowMove) {
      // Playing the player run animation and making the player face the correct direction
      this.easelPlayer.gotoAndPlay("run");
      this.easelPlayer.scaleX = 1;
      // Setting the linear velocity of player to going left while keeping the linear velocity in the y direction
      this.setLinearVelocity(player, 4, this.getLinearY(player));
      // If the keycode is space bar and allowMove is true
    } else if (keyCode == 32 && this.allowMove) {
      if (this.allowJump) {
        this.allowJump = false;
        // Setting the linear velocity of player to going up while keeping the linear velocity in the x direction
        this.setLinearVelocity(player, this.getLinearX(player), -5);
      }
    }
  };

  // Method to stop the player from moving
  stopMove = (keyCode) => {
    // Get the player
    let player = this.getPlayer();
    // If the keycode is a or d on key up
    if (keyCode == 65 || keyCode == 68) {
      // Playing the player stand animation
      this.easelPlayer.gotoAndPlay("stand");
      // The player body that sets the linear velocity
      player.GetBody().SetLinearVelocity(
        // Creates a new b2Vector and sets the x to zero while getting the y linear velocity
        new shortcut.b2Vec2(0, player.GetBody().GetLinearVelocity().y)
      );
    }
  };

  // Method that handles the attacking flag and calls a timeout
  attack = () => {
    // Sets attacking to true
    this.attacking = true;
    // Playing the attack animation for the player
    this.easelPlayer.gotoAndPlay("attack");
    // Sets attack timing to a time out that triggers after 1 sec
    this.attackTiming = setTimeout(() => {
      // Sets attacking to false
      this.attacking = false;
      // Playing the stand animation for the player
      this.easelPlayer.gotoAndPlay("stand");
    }, 1000);
  };
}

// Exporting the two Game classes, Box2D and Easel
export { EaselGame, LoZGame };
