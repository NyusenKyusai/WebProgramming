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

  getData = (datasource) => {
    let XHR = new XMLHttpRequest();
    XHR.onreadystatechange = () => {
      if (XHR.readyState == 4 && XHR.status == 200) {
        let gamedata = JSON.parse(XHR.responseText);
        gamedata.forEach((item) => {
          switch (item.type) {
            case "static":
              this.addItem(
                new defineSB(...item.objdata, this.scale, this.world),
                item.type
              );
              break;
            case "dynamic":
              this.addItem(
                new defineDB(...item.objdata, this.scale, this.world),
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
        });
        this.update();
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
}

class LoZGame extends Game {
  destroyList = () => {
    for (let i in this.destroylist) {
      this.world.DestroyBody(this.destroylist[i]);
    }
    this.destroylist.length = 0;
  };

  getEnemy = () => {
    let enemyArray = [];

    for (let item in this.itemList) {
      if (this.itemList[item].userdata.id == "orc") {
        enemyArray.push(this.itemList[item]);

        //console.log(item);
      }
    }

    return enemyArray;
  };

  gameLogic = () => {
    let playerPosition = this.getPlayer().GetBody().GetWorldCenter().x;
    let enemyArray = this.getEnemy();
    let direction = 0;

    //console.log(playerPosition.x);

    for (let enemy in enemyArray) {
      let distance =
        playerPosition - enemyArray[enemy].GetBody().GetWorldCenter().x;

      //console.log(distance);

      if (distance > 1) {
        direction = 1;
      } else if (distance < -1) {
        direction = -1;
      }

      //console.log(enemyArray[enemy].GetBody().GetLinearVelocity().x);
      //console.log(playerPosition);

      if (direction == -1) {
        if (
          enemyArray[enemy].GetBody().GetLinearVelocity().x > -1 &&
          enemyArray[enemy].GetBody().GetLinearVelocity().x <= 0
        ) {
          enemyArray[enemy]
            .GetBody()
            .ApplyImpulse(
              new shortcut.b2Vec2(2 * direction, 0),
              enemyArray[enemy].GetBody().GetWorldCenter()
            );
        }
      } else if (direction == 1) {
        if (
          enemyArray[enemy].GetBody().GetLinearVelocity().x < 1 &&
          enemyArray[enemy].GetBody().GetLinearVelocity().x >= 0
        ) {
          enemyArray[enemy]
            .GetBody()
            .ApplyImpulse(
              new shortcut.b2Vec2(2 * direction, 0),
              enemyArray[enemy].GetBody().GetWorldCenter()
            );
        }
      }

      direction = 0;
    }

    //console.log(enemyArray);
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

  move = (keyCode) => {
    let player = this.getPlayer();

    if (keyCode == 65) {
      player
        .GetBody()
        .SetLinearVelocity(
          new shortcut.b2Vec2(-4, player.GetBody().GetLinearVelocity().y)
        );
    } else if (keyCode == 68) {
      player
        .GetBody()
        .SetLinearVelocity(
          new shortcut.b2Vec2(4, player.GetBody().GetLinearVelocity().y)
        );
    } else if (keyCode == 32) {
      player
        .GetBody()
        .SetLinearVelocity(
          new shortcut.b2Vec2(player.GetBody().GetLinearVelocity().x, -5)
        );
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
