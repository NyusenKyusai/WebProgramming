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

/*****
 * Objects for Destruction
 */

let destroyList = []; // Empty list at start

/*****
 * Define Canvas and World
 */

let WIDTH = 800;
let HEIGHT = 600;
let SCALE = 30;

let world = new b2World(new b2Vec2(0, 9.81), true);

/*****
 * Utility Functions & Objects
 */

let defineNewBody = (
  density,
  friction,
  restitution,
  x,
  y,
  width,
  height,
  angle,
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
  bodyDef.angle = angle;
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

let goLeft = () => {
  hero
    .GetBody()
    .ApplyImpulse(new b2Vec2(-5, 0), hero.GetBody().GetWorldCenter());

  if (hero.GetBody().GetLinearVelocity().x < -10) {
    hero
      .GetBody()
      .SetLinearVelocity(new b2Vec2(-10, hero.GetBody().GetLinearVelocity.y));
  }
};

let goRight = () => {
  hero
    .GetBody()
    .ApplyImpulse(new b2Vec2(5, 0), hero.GetBody().GetWorldCenter());

  if (hero.GetBody().GetLinearVelocity().x > 10) {
    hero
      .GetBody()
      .SetLinearVelocity(new b2Vec2(10, hero.GetBody().GetLinearVelocity.y));
  }
};

let doJump = () => {
  hero
    .GetBody()
    .ApplyImpulse(new b2Vec2(0, -2), hero.GetBody().GetWorldCenter());
};

/*****
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
  5,
  0,
  "ground",
  "static"
);

let leftWall = defineNewBody(
  1.0,
  0.5,
  0.2,
  5,
  HEIGHT,
  5,
  HEIGHT,
  0,
  "leftWall",
  "static"
);

let tightWall = defineNewBody(
  1.0,
  0.5,
  0.2,
  WIDTH - 5,
  HEIGHT,
  5,
  HEIGHT,
  0,
  "rightWall",
  "static"
);

let plat1 = defineNewBody(1.0, 0.5, 0.1, 220, 250, 200, 5, 0.15, "plat");
let plat2 = defineNewBody(1.0, 0.5, 0.1, 450, 330, 350, 5, -0.2, "plat");
let plat3 = defineNewBody(1.0, 0.5, 0.1, 300, 500, 400, 5, 0.1, "plat");

// Dynamic

let myCircle = defineNewCircle(1.0, 1.0, 0.2, 25, 25, 20, "barrel");

setInterval(function () {
  defineNewCircle(1.0, 1.0, 0.2, 25, 25, 20, "barrel");
}, 5000);

let hero = defineNewCircle(1.0, 0.5, 0.1, 30, 570, 10, "hero");

hero.GetBody().SetFixedRotation(true);

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
var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function (contact) {
  // console.log("Begin Contact:" + contact.GetFixtureA().GetBody().GetUserData());

  let fixA = contact.GetFixtureA().GetBody().GetUserData().id;
  let fixB = contact.GetFixtureB().GetBody().GetUserData().id;

  if (fixB == "barrel" && fixA == "ground") {
    destroyList.push(contact.GetFixtureB().GetBody());
  } else if (fixA == "ground" && fixB == "barrel") {
    destroyList.push(contact.GetFixtureA().GetBody());
  }
};
listener.EndContact = function (contact) {
  // console.log("End Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.PostSolve = function (contact, impulse) {
  let fixA = contact.GetFixtureA().GetBody().GetUserData().id;
  let fixB = contact.GetFixtureB().GetBody().GetUserData().id;

  // console.log(
  //   fixA + " hits " + fixB + "with impulse " + impulse.normalImpulses[0]
  // );
};
listener.PreSolve = function (contact, oldManifold) {};
world.SetContactListener(listener);

/*****
 * Keyboard Controls
 */

$(document).keydown(function (e) {
  if (e.keyCode == 65 || e.keyCode == 37) {
    console.log("left down");
    goLeft();
  }
  if (e.keyCode == 68 || e.keyCode == 39) {
    console.log("right down");
    goRight();
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
  }
  if (e.keyCode == 68 || e.keyCode == 39) {
    console.log("right up");
  }
  if (e.keyCode == 87 || e.keyCode == 38) {
    console.log("up up");
  }
  if (e.keyCode == 83 || e.keyCode == 40) {
    console.log("down up");
  }
});
