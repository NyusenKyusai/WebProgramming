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

let WIDTH = 800;
let HEIGHT = 600;
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
  80,
  "ground",
  "static"
);

let post = defineNewBody(1.0, 0.5, 0.1, 70, 510, 10, 15, "post", "static");

// Structures
let platformData = [
  { data: [1.0, 0.5, 0.1, 600, 485, 5, 70, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 700, 485, 5, 70, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 650, 360, 70, 5, "plat", "dynamic"], type: "plankh" },
  { data: [1.0, 0.5, 0.1, 650, 305, 5, 50, "plat", "dynamic"], type: "plankv" },
  { data: [1.0, 0.5, 0.1, 650, 249, 70, 5, "plat", "dynamic"], type: "plankh" },
];

let platforms = [];

platformData.forEach((platform) => {
  platforms.push(defineNewBody(...platform.data));
});

//console.log(platforms);

// Pigs

let pigData = [
  [1.0, 0.5, 0.1, 600, 360, 10, "pig"],
  [1.0, 0.5, 0.1, 700, 360, 10, "pig"],
  [1.0, 0.5, 0.1, 600, 230, 10, "pig"],
  [1.0, 0.5, 0.1, 700, 230, 10, "pig"],
];

let pigs = [];

pigData.forEach((pig) => {
  pigs.push(defineNewCircle(...pig));
  changeUserData(pigs[pigs.length - 1], "health", 20);
});

// Dynamic

let angryBird = defineNewCircle(1.0, 0.5, 0.1, 70, 470, 20, "angrybird");

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
