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

const makeHorizontalTile = (loaderImg, fillWidth, tileWidth) => {
  let theRect = new createjs.Shape();
  theRect.graphics
    .beginBitmapFill(loaderImg)
    .drawRect(0, 0, fillWidth + loaderImg.width, loaderImg.height);
  theRect.tileW = tileWidth;
  theRect.snapToPixel = true;

  return theRect;
};

const handleComplete = () => {
  easelSky = makeBitmap(loader.getResult("sky"), stageWidth, stageHeight);
  easelSky.x = 0;
  easelSky.y = 0;

  let hill1Img = loader.getResult("hill1");
  let hill2Img = loader.getResult("hill2");

  let groundImg = loader.getResult("ground");

  easelHill1 = makeBitmap(hill1Img, hill1Img.width, hill1Img.height);
  easelHill1.x = Math.random() * stageWidth;
  easelHill1.y = HEIGHT - easelHill1.image.height - groundImg.height;

  easelHill2 = makeBitmap(hill2Img, hill2Img.width, hill2Img.height);
  easelHill2.x = Math.random() * stageWidth;
  easelHill2.y = HEIGHT - easelHill2.image.height - groundImg.height;

  easelGround = makeHorizontalTile(groundImg, stageWidth, 81);
  easelGround.x = 0;
  easelGround.y = HEIGHT - groundImg.height;

  // prettier-ignore
  let spritesheet = new createjs.SpriteSheet({
    framerate: 30,
    "images": [loader.getResult("grant")],
    "frames": {
      "regX": 82, "regY": 144,
      "width": 165, "height": 292,
      "count": 64
    },
    "animations": {
      "stand": [56, 57, "stand", 1],
      "run": [0, 25, "run", 1.5],
      "jump": [26, 63, "stand", 1]
    }
  });

  easelGrant = new createjs.Sprite(spritesheet, "stand");
  easelGrant.snapToPixel = true;

  stage.addChild(easelSky, easelHill1, easelHill2, easelGround, easelGrant);

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

let goLeft = () => {
  if (!keydown) {
    easelGrant.gotoAndPlay("run");
    easelGrant.scaleX = -1;
  }

  b2grant
    .GetBody()
    .SetLinearVelocity(new b2Vec2(-4, b2grant.GetBody().GetLinearVelocity().y));
};

let goRight = () => {
  if (!keydown) {
    easelGrant.gotoAndPlay("run");
    easelGrant.scaleX = 1;
  }

  b2grant
    .GetBody()
    .SetLinearVelocity(new b2Vec2(4, b2grant.GetBody().GetLinearVelocity().y));
};

let stopLefRight = () => {
  easelGrant.gotoAndPlay("stand");

  b2grant
    .GetBody()
    .SetLinearVelocity(new b2Vec2(0, b2grant.GetBody().GetLinearVelocity().y));
};

let doJump = () => {
  easelGrant.gotoAndPlay("jump");

  b2grant
    .GetBody()
    .SetLinearVelocity(
      new b2Vec2(b2grant.GetBody().GetLinearVelocity().x, -10)
    );
};

/****
 * Our World Objects
 */

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

// Dynamic

let b2grant = defineNewBody(
  1.0,
  0,
  0.1,
  70,
  200,
  72,
  140,
  "angrybird",
  "dynamic"
);

b2grant.GetBody().IsFixedRotation = true;

let easelGround, easelHill1, easelHill2, easelGrant, easelSky;

const init = () => {
  easelCan = document.getElementById("easelcan");
  easelCTX = easelCan.getContext("2d");
  stage = new createjs.Stage(easelCan);
  stage.snapPixelsEnabled = true;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;

  let manifest = [
    { src: "ground.png", id: "ground" },
    { src: "sky.png", id: "sky" },
    { src: "hill1.png", id: "hill1" },
    { src: "hill2.png", id: "hill2" },
    { src: "spritesheet_grant.png", id: "grant" },
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

  easelGrant.x = b2grant.GetBody().GetPosition().x * SCALE;
  easelGrant.y = b2grant.GetBody().GetPosition().y * SCALE;

  for (let i in destroyList) {
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
};
listener.PreSolve = function (contact, oldManifold) {};
world.SetContactListener(listener);

/*****
 * Keyboard Controls
 */

let keydown = false;

$(document).keydown(function (e) {
  if (e.keyCode == 65 || e.keyCode == 37) {
    console.log("left down");
    goLeft();

    keydown = true;
  }
  if (e.keyCode == 68 || e.keyCode == 39) {
    console.log("right down");
    goRight();

    keydown = true;
  }
  if (e.keyCode == 87 || e.keyCode == 38) {
    console.log("up down");
    doJump();
  }
  if (e.keyCode == 83 || e.keyCode == 40) {
    console.log("down down");
  }
});

$(document).keyup(function (e) {
  if (e.keyCode == 65 || e.keyCode == 37) {
    console.log("left up");

    stopLefRight();
    keydown = false;
  }
  if (e.keyCode == 68 || e.keyCode == 39) {
    console.log("right up");

    stopLefRight();
    keydown = false;
  }
  if (e.keyCode == 87 || e.keyCode == 38) {
    console.log("up up");
  }
  if (e.keyCode == 83 || e.keyCode == 40) {
    console.log("down up");
  }
});

/*****
 * Mouse Controls
 */
