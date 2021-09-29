class Game {
  height;
  width;
  scale;
  gravity;
  framerate;
  b2dcanvas;
  b2dctx;
  itemList = [];
  destroylist = [];
  mouseHandler = [];

  constructor(height, width, scale, gx, gy, framerate, canvasname) {
    this.height = height;
    this.width = width;
    this.scale = scale;
    this.gravity = new b2Vec2(gx, gy);
    this.framerate = framerate;
    this.b2dcanvas = document.getElementById(canvasname);
    this.b2dctx = this.b2dcanvas.getContext("2d");
    this.world = new b2World(this.gravity, true);
  }

  setupDebugDraw = () => {
    let debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(this.b2dctx);
    debugDraw.SetDrawScale(this.scale);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
  };

  update = () => {
    this.world.Step(1 / this.framerate, 10, 10);
    this.gameLogic();
    this.world.DrawDebugData();
    this.world.ClearForces();
    this.destroyList();

    window.requestAnimationFrame(this.update);
  };

  gameLogic = () => {};

  addItem = (item) => {
    this.itemList.push(item);
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
                new defineSB(...item.objdata, this.scale, this.world)
              );
              break;
            case "dynamic":
              this.addItem(
                new defineDB(...item.objdata, this.scale, this.world)
              );
              break;
            case "dynamiccircle":
              this.addItem(
                new defineDCB(...item.objdata, this.scale, this.world)
              );
              break;
            default:
              console.log("Item type not recognised");
          }
          if (typeof item.userdata == "object") {
            for (let key in item.userdata) {
              this.itemList[mygame.itemList.length - 1].changeUserData(
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

  addMouseHandler(mousectx, type, runFunction) {
    this.mouseHandler.push(new mouseHandler(mousectx, type, runFunction));
  }

  handleMouseDown = (e) => {
    console.log(e);
  };

  handleMouseUp = (e) => {
    console.log(e);
  };
}

class AGame extends Game {
  firebird = false;
  startX;
  startY;
  score = 0;

  destroyList = () => {
    for (let i in this.destroylist) {
      if (this.destroylist[i].GetUserData().id == "pig") {
        this.score += 30;
        $("#score").html(this.score);
      }

      this.world.DestroyBody(this.destroylist[i]);
    }
    this.destroylist.length = 0;
  };

  gameLogic = () => {};

  handleMouseDown = (e) => {
    let angrybird;

    this.itemList.forEach((item) => {
      if (item.userdata.id === "angrybird") {
        angrybird = item;
      }
    });

    let bodyX = angrybird.GetBody().GetPosition().x * this.scale;
    let bodyY = angrybird.GetBody().GetPosition().y * this.scale;
    let radius = 20;
    let clickX = e.offsetX;
    let clickY = e.offsetY;
    let relativePosition = (clickX - bodyX) ** 2 + (clickY - bodyY) ** 2;

    if (relativePosition <= radius ** 2) {
      this.fireBird = true;

      this.startX = clickX;
      this.startY = clickY;
    }
  };

  handleMouseUp = (e) => {
    if (this.fireBird) {
      let angrybird;

      this.itemList.forEach((item) => {
        if (item.userdata.id === "angrybird") {
          angrybird = item;
        }
      });

      let endX = e.offsetX;
      let endY = e.offsetY;

      // prettier-ignore
      let magnitude = Math.sqrt(((endX - this.startX) ** 2) + ((endY - this.startY) ** 2));
      let direction = Math.atan((endY - this.startY) / (endX - this.startX));

      console.log(magnitude);

      let xVector = Math.cos(direction) * magnitude;
      if (endX > this.startX) {
        xVector = xVector * -1;
      }

      let yVector = Math.sin(direction) * magnitude;

      // if (endY < startY) {
      //   yVector = yVector * -1;
      // }

      //console.log("xVec = " + xVector + " yVec = " + yVector);

      angrybird
        .GetBody()
        .ApplyImpulse(
          new b2Vec2(xVector, yVector),
          angrybird.GetBody().GetWorldCenter()
        );

      this.fireBird = false;
    }
  };
}

let mygame = new AGame(600, 800, 30, 0, 9.81, 60, "b2dcan");
mygame.setupDebugDraw();
mygame.getData("./gamedata.json");

mygame.addMouseHandler(mygame.b2dcanvas, "mousedown", mygame.handleMouseDown);
mygame.addMouseHandler(mygame.b2dcanvas, "mouseup", mygame.handleMouseUp);

let AngryContact = b2Listener;

AngryContact.PostSolve = (contact, impulse) => {
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  let isPig = false;
  let pigparent;

  if (fixA.id == "pig") {
    isPig = contact.GetFixtureA();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixA.uniquename) {
        pigparent = item;
      }
    });
  }

  if (fixB.id == "pig") {
    isPig = contact.GetFixtureB();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixB.uniquename) {
        pigparent = item;
      }
    });
  }

  if (isPig != false) {
    if (impulse.normalImpulses[0] > 0.5) {
      let currentHealth = isPig.GetBody().GetUserData().health;

      currentHealth -= impulse.normalImpulses[0] * 5;

      if (currentHealth <= 0) {
        mygame.destroylist.push(isPig.GetBody());
      } else {
        pigparent.changeUserData("health", currentHealth);
      }
    }
  }
};

mygame.world.SetContactListener(AngryContact);
