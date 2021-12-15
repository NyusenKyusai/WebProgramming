"use strict";
/****
 * BOX2DWEB Definitions
 */

let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2Fixture = Box2D.Dynamics.b2Fixture;
let b2World = Box2D.Dynamics.b2World;
let b2MassData = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

/**
 * EaselJS Global Things
 */

let easelCan, easelCTX, loader, stage, stageHeight, stageWidth;

/*****
 * Objects for Destruction
 */

let destroyList = [];

/*****
 * Define Canvas and World
 */

let WIDTH = 1200;
let HEIGHT = 800;
let SCALE = 30;

let world = new b2World(new b2Vec2(0, 9.81), true);

let defineNewBody = (
  density,
  friction,
  restitution,
  x,
  y,
  width,
  height,
  objID,
  objectType
) => {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction;
  fixDef.restitution = restitution;
  let bodyDef = new b2BodyDef();

  if (objectType == "static") {
    bodyDef.type = b2Body.b2_staticBody;
  } else if (objectType == "dynamic") {
    bodyDef.type = b2Body.b2_dynamicBody;
  }
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;
  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
  let thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisobj.GetBody().SetUserData({ id: objID });
  return thisobj;
};

let defineNewCircle = (density, friction, restitution, x, y, r, objID) => {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction;
  fixDef.restitution = restitution;
  let bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;
  fixDef.shape = new b2CircleShape(r / SCALE);
  let thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisobj.GetBody().SetUserData({ id: objID });
  return thisobj;
};

let changeUserData = (target, property, newValue) => {
  let currentData = target.GetBody().GetUserData();

  currentData[property] = newValue;

  target.GetBody().SetUserData(currentData);

  //console.log(target.GetBody().GetUserData());
};

const tick = (e) => {
  update();
  stage.update(e);
};

const handleComplete = () => {
  easelGround = makeBitmap(
    loader.getResult("background"),
    stageWidth,
    stageHeight + 140
  );
  easelGround.x = 0;
  easelGround.y = 0;

  easelPost = makeBitmap(loader.getResult("plankv"), 10, 15);
  easelPost.x = post.GetBody().GetPosition().x * SCALE;
  easelPost.y = post.GetBody().GetPosition().y * SCALE;

  easelBird = makeBitmap(loader.getResult("bird"), 20, 20);

  stage.addChild(easelGround, easelPost, easelBird);

  for (let i in pigData) {
    easelPigs.push(
      makeBitmap(loader.getResult("pig"), pigData[i][5], pigData[i][5])
    );
    stage.addChild(easelPigs[easelPigs.length - 1]);
  }

  plankH = loader.getResult("plankh");
  plankV = loader.getResult("plankv");

  for (let i in platformData) {
    let planktype = platformData[i].type == "plankh" ? plankH : plankV;
    //console.log(planktype);

    easelPlats.push(
      makeBitmap(planktype, platformData[i].data[5], platformData[i].data[6])
    );

    stage.addChild(easelPlats[easelPlats.length - 1]);
  }

  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);
};

/**
 * EaselJS Helpers
 */

const makeBitmap = (loaderImg, b2x, b2y) => {
  let theImage = new createjs.Bitmap(loaderImg);

  let scaleX = (b2x * 2) / theImage.image.naturalWidth;
  let scaleY = (b2y * 2) / theImage.image.naturalHeight;

  theImage.scaleX = scaleX;
  theImage.scaleY = scaleY;

  theImage.regX = theImage.image.width / 2;
  theImage.regY = theImage.image.height / 2;

  return theImage;
};

/**
 * Viewport Helper
 */

let initialised = false;
let animationComplete = false;

const followBird = () => {
  if (!initialised && !animationComplete) {
    $("#easelcan").css({
      transform: "scale(0.7)",
      top: -210,
      left: -400,
    });

    initialised = true;

    $("#easelcan").animate(
      {
        left: -100,
        top: -300,
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
        complete: function () {
          animationComplete = true;
        },
      }
    );
  }

  if (animationComplete && initialised) {
    let zoomPadding = 100;
    let VP = Object.create({});
    VP.width = $("#viewport").width();
    VP.height = $("#viewport").height();
    VP.left = parseInt($("#easelcan").css("left"));
    VP.top = parseInt($("#easelcan").css("top"));

    let AW = Object.create({});
    AW.leftPad = 100;
    AW.topPad = 150;
    AW.rightPad = 200;
    AW.bottomPad = 200;

    let leftLimitMax = WIDTH - VP.width - zoomPadding;
    let leftLimitMin = zoomPadding;

    let topLimitMax = HEIGHT - VP.height - zoomPadding;
    let topLimitMin = zoomPadding;

    let leftPosition = 0;
    let topPosition = 0;

    let birdposx = angryBird.GetBody().GetPosition().x * SCALE;

    var ltr = angryBird.GetBody().GetLinearVelocity().x >= 0 ? true : false;

    if (birdposx >= VP.left + (VP.width - AW.rightPad) && ltr) {
      leftPosition = birdposx + AW.rightPad - VP.width;
    } else if (birdposx >= -VP.left + AW.leftPad) {
      leftPosition = birdposx = AW.leftPad;
    } else {
      leftPosition = -VP.left;
    }

    if (leftPosition < leftLimitMin) leftPosition = leftLimitMin;
    if (leftPosition > leftLimitMax) leftPosition = leftLimitMax;

    $("#easelcan").css({ left: -leftPosition, transition: "left 34ms" });

    let birdposy = angryBird.GetBody().GetPosition().y * SCALE;

    if (birdposy >= VP.top + (VP.height = AW.bottomPad)) {
      topPosition = birdposy + AW.bottomPad - VP.height;
    } else if (birdposy <= (-VP, top) + AW.topPad) {
      topPosition = birdposy - AW.topPad;
    } else {
      topPosition = -VP.top;
    }

    if (topPosition < topLimitMin) topPosition = topLimitMin;
    if (topPosition > topLimitMax) topPosition = topLimitMax;

    $("#easelcan").css({ top: -topPosition, transition: "top 34ms" });

    let birdVelocity = Math.abs(angryBird.GetBody().GetLinearVelocity().x) / 10;

    let scale =
      birdVelocity < 0.8 && birdVelocity > 0.1
        ? 1.1
        : birdVelocity > 1.1
        ? 0.8
        : 1;

    $("#easelcan").css({
      transform: "scale( " + scale + ")",
      transition: "transform 3000ms",
    });
  }
};

/****
 * Our World Objects
 */

let fireBird = false;
let startX, startY;
let score = 0;

// Static
let ground = defineNewBody(
  1.0,
  0.5,
  0.2,
  WIDTH / 2,
  HEIGHT,
  WIDTH / 2,
  145,
  "ground",
  "static"
);

let post = defineNewBody(1.0, 0.5, 0.1, 170, 640, 10, 15, "post", "static");

// Structures
let platformData = [
  { data: [1.0, 0.5, 0.1, 800, 595, 5, 70, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 900, 595, 5, 70, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 850, 490, 70, 5, "plat", "dynamic"], type: "plankh" },
  { data: [1.0, 0.5, 0.1, 850, 425, 5, 50, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 850, 369, 70, 5, "plat", "dynamic"], type: "plankh" },
];

let platforms = [];

platformData.forEach((platform) => {
  platforms.push(defineNewBody(...platform.data));
});

//console.log(platforms);

// Pigs

let pigData = [
  [1.0, 0.5, 0.1, 800, 450, 10, "pig"],
  [1.0, 0.5, 0.1, 900, 450, 10, "pig"],
  [1.0, 0.5, 0.1, 800, 330, 10, "pig"],
  [1.0, 0.5, 0.1, 900, 330, 10, "pig"],
];

let pigs = [];

pigData.forEach((pig) => {
  pigs.push(defineNewCircle(...pig));
  changeUserData(pigs[pigs.length - 1], "health", 20);
});

// Dynamic

let angryBird = defineNewCircle(1.0, 0.5, 0.1, 170, 570, 20, "angrybird");

let easelBird, easelGround, easelPost, plankH, plankV;
let easelPlats = [];
let easelPigs = [];

const init = () => {
  easelCan = document.getElementById("easelcan");
  easelCTX = easelCan.getContext("2d");
  stage = new createjs.Stage(easelCan);
  stage.snapPixelsEnabled = true;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;

  let manifest = [
    { src: "background.png", id: "background" },
    { src: "bird.png", id: "bird" },
    { src: "pig.png", id: "pig" },
    { src: "plankh.png", id: "plankh" },
    { src: "plankv.png", id: "plankv" },
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true, "./assets/");

  /*
Debug Draw
*/

  let debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(document.getElementById("b2dcan").getContext("2d"));
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);
};
// Update World Loop

let update = () => {
  world.Step(1 / 60, 10, 10);
  world.DrawDebugData();
  world.ClearForces();

  easelBird.x = angryBird.GetBody().GetPosition().x * SCALE;
  easelBird.y = angryBird.GetBody().GetPosition().y * SCALE;
  easelBird.rotation = angryBird.GetBody().GetAngle() * (180 / Math.PI);

  for (let i in pigs) {
    easelPigs[i].x = pigs[i].GetBody().GetPosition().x * SCALE;
    easelPigs[i].y = pigs[i].GetBody().GetPosition().y * SCALE;
    easelPigs.rotation = pigs[i].GetBody().GetAngle() * (180 / Math.PI);
  }

  for (let i in easelPlats) {
    //console.log(easelPlats[i]);
    //console.log(platforms[i].GetBody().GetPosition().x * SCALE);
    easelPlats[i].x = platforms[i].GetBody().GetPosition().x * SCALE;
    easelPlats[i].y = platforms[i].GetBody().GetPosition().y * SCALE;
    easelPlats[i].rotation =
      platforms[i].GetBody().GetAngle() * (180 / Math.PI);
  }

  followBird();

  for (let i in destroyList) {
    if ((destroyList[i].GetUserData().id = "pig")) {
      score += 30;
      $("#score").html(score);

      stage.removeChild(easelPigs[i]);
      easelPigs.splice(i, 1);
      pigs.splice(i, 1);
    }
    world.DestroyBody(destroyList[i]);
  }
  destroyList.length = 0;

  //window.requestAnimationFrame(update);
};

//window.requestAnimationFrame(update);
init();

/*****
 * Listeners
 */

// prettier-ignore
var listener = new Box2D.Dynamics.b2ContactListener();
listener.BeginContact = function (contact) {
  //console.log("Begin Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.EndContact = function (contact) {
  //console.log("End Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.PostSolve = function (contact, impulse) {
  //   console.log(
  //     fixA + " hits " + fixB + "with impulse " + impulse.normalImpulses[0]
  //   );

  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  let isPig = false;

  if (fixA.id == "pig") {
    isPig = contact.GetFixtureA();
  }

  if (fixB.id == "pig") {
    isPig = contact.GetFixtureB();
  }

  if (isPig != false) {
    if (impulse.normalImpulses[0] > 0.5) {
      let currentHealth = isPig.GetBody().GetUserData().health;

      currentHealth -= impulse.normalImpulses[0] * 5;

      if (currentHealth <= 0) {
        destroyList.push(isPig.GetBody());
      } else {
        changeUserData(isPig, "health", currentHealth);
      }
    }
  }
};
listener.PreSolve = function (contact, oldManifold) {};
world.SetContactListener(listener);

/*****
 * Keyboard Controls
 */

/*****
 * Mouse Controls
 */

$("#easelcan").mousedown(function (e) {
  // (x1 - x2)**2 + (y1 - y2)**2 <= radius**2
  let bodyX = angryBird.GetBody().GetPosition().x * SCALE;
  let bodyY = angryBird.GetBody().GetPosition().y * SCALE;
  let radius = 20;
  let clickX = e.offsetX;
  let clickY = e.offsetY;
  let relativePosition = (clickX - bodyX) ** 2 + (clickY - bodyY) ** 2;

  if (relativePosition <= radius ** 2) {
    fireBird = true;

    startX = clickX;
    startY = clickY;
  }
});

$("#easelcan").mouseup(function (e) {
  if (fireBird) {
    let endX = e.offsetX;
    let endY = e.offsetY;

    // prettier-ignore
    let magnitude = Math.sqrt(((endX - startX) ** 2) + ((endY - startY) ** 2));
    let direction = Math.atan((endY - startY) / (endX - startX));

    //console.log(magnitude);

    let xVector = Math.cos(direction) * magnitude;
    if (endX > startX) {
      xVector = xVector * -1;
    }

    let yVector = Math.sin(direction) * magnitude;

    // if (endY < startY) {
    //   yVector = yVector * -1;
    // }
    //console.log("xVec = " + xVector + " yVec = " + yVector);

    angryBird
      .GetBody()
      .ApplyImpulse(
        new b2Vec2(xVector, yVector),
        angryBird.GetBody().GetWorldCenter()
      );

    fireBird = false;
  }
});
