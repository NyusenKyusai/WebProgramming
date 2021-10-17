import * as shortcut from "./shortcuts.js";
import { defineSB, defineDB, defineDCB } from "./classLib.js";
import * as handlers from "./eventHandlers.js";

class Game {
  height;
  width;
  scale;
  gravity;
  framerate;
  b2dcanvas;
  document;
  b2dctx;
  world;
  gameStart = true;
  allowMove = true;
  invisible = false;
  collisionList = ["wall", "ground", "sensor"];
  currentLevel = 1;
  itemList = [];
  destroylist = [];
  keyboardHandler = [];
  mouseHandler = [];

  constructor(height, width, scale, gx, gy, framerate, canvasname) {
    this.height = height;
    this.width = width;
    this.scale = scale;
    this.gravity = new shortcut.b2Vec2(gx, gy);
    this.framerate = framerate;
    this.b2dcanvas = document.getElementById(canvasname);

    this.b2dctx = this.b2dcanvas.getContext("2d");
    this.world = new shortcut.b2World(this.gravity, true);
  }

  setupDebugDraw = () => {
    let debugDraw = new shortcut.b2DebugDraw();
    debugDraw.SetSprite(this.b2dctx);
    debugDraw.SetDrawScale(this.scale);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(
      shortcut.b2DebugDraw.e_shapeBit | shortcut.b2DebugDraw.e_jointBit
    );
    this.world.SetDebugDraw(debugDraw);
  };

  update = () => {
    this.world.Step(1 / this.framerate, 10, 10);
    this.gameLogic();
    this.world.DrawDebugData();
    this.world.ClearForces();
    this.world.m_allowSleep = false;
    this.destroyList();

    window.requestAnimationFrame(this.update);
  };

  gameLogic = () => {};

  addItem = (item, type) => {
    this.itemList.push(item);

    if (item.userdata.id === "player") {
      item.GetBody().allowSleep = false;

      //console.log(item.GetBody().allowSleep);
    }

    if (type == "dynamic") {
      item.GetBody().SetAngularDamping(100000000000);
    }
  };

  destroyList = () => {
    for (let i in this.destroylist) {
      this.world.DestroyBody(this.destroylist[i]);
    }

    this.destroyList.length = 0;
  };

  getData = (datasource, level) => {
    let XHR = new XMLHttpRequest();
    XHR.onreadystatechange = () => {
      if (XHR.readyState == 4 && XHR.status == 200) {
        let gamedata = JSON.parse(XHR.responseText);
        gamedata.forEach((item) => {
          if (item.level == level || item.level == 0) {
            switch (item.type) {
              case "static":
                this.addItem(
                  new defineSB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
                  item.type
                );
                break;
              case "dynamic":
                this.addItem(
                  new defineDB(
                    ...item.objdata,
                    this.scale,
                    this.world,
                    item.level
                  ),
                  item.type
                );
                break;
              case "dynamiccircle":
                this.addItem(
                  new defineDCB(...item.objdata, this.scale, this.world),
                  item.type
                );
                break;
              default:
                console.log("Item type not recognised");
            }
            if (typeof item.userdata == "object") {
              for (let key in item.userdata) {
                this.itemList[this.itemList.length - 1].changeUserData(
                  key,
                  item.userdata[key]
                );
              }
            }
          }
        });
        if (this.gameStart) {
          this.update();
          this.gameStart = false;
        }
      }
    };
    XHR.open("GET", datasource, true);
    XHR.send();
  };

  addKeyboardHandler(type, runFunction) {
    this.keyboardHandler.push(new handlers.keyboardHandler(type, runFunction));
  }

  addMouseHandler(mousectx, type, runFunction) {
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

  increaseLevel = () => {
    this.currentLevel++;
  };
}

class LoZGame extends Game {
  slimeTimer = true;

  destroyList = () => {
    for (let i in this.destroylist) {
      this.world.DestroyBody(this.destroylist[i]);
    }
    this.destroylist.length = 0;
  };

  spawn = (uniquename) => {
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
  };

  getEnemy = () => {
    let enemyArray = [];

    for (let item in this.itemList) {
      if (
        this.itemList[item].userdata.id == "orc" ||
        this.itemList[item].userdata.id == "slime" ||
        this.itemList[item].userdata.id == "boss"
      ) {
        enemyArray.push(this.itemList[item]);

        //console.log(item);
      }
    }

    return enemyArray;
  };

  getDistance = (player, enemy) => {
    let distance =
      player.GetBody().GetWorldCenter().x - enemy.GetBody().GetWorldCenter().x;

    return distance;
  };

  getDirection = (distance) => {
    let direction = 0;

    if (distance > 1) {
      direction = 1;
    } else if (distance < -1) {
      direction = -1;
    }

    return direction;
  };

  applyImpulse = (direction, fixture, x, y) => {
    fixture
      .GetBody()
      .ApplyImpulse(
        new shortcut.b2Vec2(x * direction, y),
        fixture.GetBody().GetWorldCenter()
      );
  };

  enemyMove = (enemy, direction) => {
    let self = this;

    switch (enemy.userdata.id) {
      case "orc":
        this.applyImpulse(direction, enemy, 3, 0);
        break;
      case "slime":
        // if (this.slimeTimer == true) {
        this.applyImpulse(direction, enemy, 3, -10);

        //   this.slimeTimer = false;
        // }

        // setInterval(function () {
        //   self.slimeTimer = true;
        // }, 5000);

        break;
      case "boss":
        this.applyImpulse(direction, enemy, 3, 0);
        break;
    }
  };

  gameLogic = () => {
    let player = this.getPlayer();
    let enemyArray = this.getEnemy();

    for (let enemy in enemyArray) {
      let distance = this.getDistance(player, enemyArray[enemy]);

      let direction = this.getDirection(distance);

      if (direction == -1) {
        if (
          enemyArray[enemy].GetBody().GetLinearVelocity().x > -1 &&
          enemyArray[enemy].GetBody().GetLinearVelocity().x <= 0
        ) {
          this.enemyMove(enemyArray[enemy], direction);
        }
      } else if (direction == 1) {
        if (
          enemyArray[enemy].GetBody().GetLinearVelocity().x < 1 &&
          enemyArray[enemy].GetBody().GetLinearVelocity().x >= 0
        ) {
          this.enemyMove(enemyArray[enemy], direction);
        }
      }

      direction = 0;
    }

    //console.log(enemyArray);
  };

  getLinearX = (body) => {
    return body.GetBody().GetLinearVelocity().x;
  };

  getLinearY = (body) => {
    return body.GetBody().GetLinearVelocity().y;
  };

  setLinearVelocity = (body, x, y) => {
    body.GetBody().SetLinearVelocity(new shortcut.b2Vec2(x, y));
  };

  getPlayer = () => {
    let player;

    this.itemList.forEach((item) => {
      if (item.userdata.id === "player") {
        player = item;
      }
    });

    return player;
  };

  getInvisible = () => {
    return this.invisible;
  };

  getAllowMove = () => {
    return this.allowMove;
  };

  setInvisible = (boolean) => {
    this.invisible = boolean;
  };

  setAllowMove = (boolean) => {
    this.allowMove = boolean;
  };

  move = (keyCode) => {
    let player = this.getPlayer();

    if (keyCode == 65 && this.allowMove) {
      this.setLinearVelocity(player, -4, this.getLinearY(player));
    } else if (keyCode == 68 && this.allowMove) {
      this.setLinearVelocity(player, 4, this.getLinearY(player));
    } else if (keyCode == 32 && this.allowMove) {
      this.setLinearVelocity(player, this.getLinearX(player), -5);
    }
  };

  stopMove = (keyCode) => {
    let player = this.getPlayer();

    if (keyCode == 65 || keyCode == 68) {
      player
        .GetBody()
        .SetLinearVelocity(
          new shortcut.b2Vec2(0, player.GetBody().GetLinearVelocity().y)
        );
    }
  };

  handleKeyDown = (e) => {
    this.move(e.keyCode);
  };

  handleKeyUp = (e) => {
    this.stopMove(e.keyCode);
  };
}

export default LoZGame;
