"use strict";

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

  console.log(target.GetBody().GetUserData());
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
  5,
  "ground",
  "static"
);

let post = defineNewBody(1.0, 0.5, 0.1, 70, 575, 5, 30, "post", "static");

// Structures
let platformData = [
  [1.0, 0.5, 0.1, 600, 575, 5, 70, "plat", "dynamic"],
  [1.0, 0.5, 0.1, 700, 575, 5, 70, "plat", "dynamic"],
  [1.0, 0.5, 0.1, 650, 450, 70, 5, "plat", "dynamic"],
  [1.0, 0.5, 0.1, 650, 395, 5, 50, "plat", "dynamic"],
  [1.0, 0.5, 0.1, 650, 339, 70, 5, "plat", "dynamic"],
];

let platforms = [];

platformData.forEach((platform) => {
  platforms.push(defineNewBody(...platform));
});

// Pigs

let pigData = [
  [1.0, 0.5, 0.1, 600, 430, 10, "pig"],
  [1.0, 0.5, 0.1, 700, 430, 10, "pig"],
  [1.0, 0.5, 0.1, 600, 320, 10, "pig"],
  [1.0, 0.5, 0.1, 700, 320, 10, "pig"],
];

let pigs = [];

pigData.forEach((pig) => {
  pigs.push(defineNewCircle(...pig));
  changeUserData(pigs[pigs.length - 1], "health", 20);
});

// Dynamic

let angryBird = defineNewCircle(1.0, 0.5, 0.1, 70, 520, 20, "angrybird");

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

// Update World Loop

let update = () => {
  world.Step(1 / 60, 10, 10);
  world.DrawDebugData();
  world.ClearForces();

  for (let i in destroyList) {
    if (destroyList[i].GetUserData().id == "pig") {
      score += 30;
      $("#score").html(score);
    }
    world.DestroyBody(destroyList[i]);
  }
  destroyList.length = 0;

  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);

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

$("#b2dcan").mousedown(function (e) {
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

$("#b2dcan").mouseup(function (e) {
  if (fireBird) {
    let endX = e.offsetX;
    let endY = e.offsetY;

    // prettier-ignore
    let magnitude = Math.sqrt(((endX - startX) ** 2) + ((endY - startY) ** 2));
    let direction = Math.atan((endY - startY) / (endX - startX));

    console.log(magnitude);

    let xVector = Math.cos(direction) * magnitude;
    if (endX > startX) {
      xVector = xVector * -1;
    }

    let yVector = Math.sin(direction) * magnitude;

    // if (endY < startY) {
    //   yVector = yVector * -1;
    // }

    console.log("xVec = " + xVector + " yVec = " + yVector);

    angryBird
      .GetBody()
      .ApplyImpulse(
        new b2Vec2(xVector, yVector),
        angryBird.GetBody().GetWorldCenter()
      );

    fireBird = false;
  }
});
