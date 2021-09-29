"use strict";
/****
 * BOX2DWEB Definitions
 */

const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2Fixture = Box2D.Dynamics.b2Fixture;
const b2World = Box2D.Dynamics.b2World;
const b2MassData = Box2D.Collision.Shapes.b2MassData;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

/*****
 * Objects for Destruction
 */

let destroyList = [];
let jointDestroyList = [];

/*****
 * Define Canvas and World
 */

const WIDTH = 800;
const HEIGHT = 600;
const SCALE = 30;

const world = new b2World(new b2Vec2(0, 9.81), true);

const defineNewBody = (
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

const defineNewCircle = (density, friction, restitution, x, y, r, objID) => {
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

const defineRevJoint = (item1, item2) => {
  let joint = new Box2D.Dynamics.Joints.b2RevoluteJointDef();

  joint.Initialize(
    item1.GetBody(),
    item2.GetBody(),
    item1.GetBody().GetWorldCenter()
  );

  return world.CreateJoint(joint);
};

const defineDistanceJoint = (item1, item2) => {
  let joint = new Box2D.Dynamics.Joints.b2DistanceJointDef();

  joint.Initialize(
    item1.GetBody(),
    item2.GetBody(),
    item1.GetBody().GetWorldCenter(),
    item2.GetBody().GetWorldCenter()
  );

  return world.CreateJoint(joint);
};

const destroyJoint = (joint) => {
  world.DestroyJoint(joint);
};

const circleCollision = (mouseX, mouseY, circleRadius) => {
  for (let i in disJoints) {
    let p1x = disJoints[i].GetAnchorA().x * SCALE;
    let p1y = disJoints[i].GetAnchorA().y * SCALE;

    let p2x = disJoints[i].GetAnchorB().x * SCALE;
    let p2y = disJoints[i].GetAnchorB().y * SCALE;

    let localp1x = p1x - mouseX;
    let localp1y = p1y - mouseY;

    let localp2x = p2x - mouseX;
    let localp2y = p2y - mouseY;

    let PMx = localp2x - localp1x;
    let PMy = localp2y - localp1y;

    let a = PMx ** 2 + PMy ** 2;
    let b = 2 * (PMx * localp1x + PMy * localp1y);
    let c = localp1x ** 2 + localp1y ** 2 - circleRadius;

    let delta = b ** 2 - 4 * a * c;

    if (delta < 0) {
      console.log("No collisions");
    } else if (delta == 0) {
      // console.log("One collision");
      destroyJoint(disJoints[i]);
    } else {
      console.log("Multiple collisions");
      destroyJoint(disJoints[i]);
    }
  }
};

const lineCollision = (m1x, m1y, m2x, m2y) => {
  for (let i in disJoints) {
    let p1x = disJoints[i].GetAnchorA().x * SCALE;
    let p1y = disJoints[i].GetAnchorA().y * SCALE;

    let p2x = disJoints[i].GetAnchorB().x * SCALE;
    let p2y = disJoints[i].GetAnchorB().y * SCALE;

    let gamma, lambda;
    let determinant = (m2x - m1x) * (p2y - p1y) - (p2x - p1x) * (m2y - m1y);

    if (determinant != 0) {
      lambda =
        ((p2y - p1y) * (p2x - m1x) + (p1x - p2x) * (p2y - m1y)) / determinant;

      gamma =
        ((m1y - m2y) * (p2x - m1x) + (m2x - m1x) * (p2y - m1y)) / determinant;
    }

    if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
      destroyJoint(disJoints[i]);
    }
  }
};

/****
 * Our World Objects
 */

let disJoints = [];

// Static
let plat1 = defineNewBody(
  1.0,
  1.0,
  0.1,
  150,
  50,
  10,
  10,
  "ropeanchor",
  "static"
);

let plat2 = defineNewBody(
  1.0,
  1.0,
  0.1,
  400,
  50,
  10,
  10,
  "ropeanchor",
  "static"
);

let plat3 = defineNewBody(
  1.0,
  1.0,
  0.1,
  650,
  50,
  10,
  10,
  "ropeanchor",
  "static"
);

// Dynamic

let ball = defineNewCircle(1.0, 0.2, 0.1, 400, 300, 20, "ball");

disJoints.push(defineDistanceJoint(plat1, ball));
disJoints.push(defineDistanceJoint(plat2, ball));
disJoints.push(defineDistanceJoint(plat3, ball));

/*
Debug Draw
*/

const debugDraw = new b2DebugDraw();
debugDraw.SetSprite(document.getElementById("b2dcan").getContext("2d"));
debugDraw.SetDrawScale(SCALE);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

// Update World Loop

const update = () => {
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
const listener = new Box2D.Dynamics.b2ContactListener();
listener.BeginContact = function (contact) {
  //console.log("Begin Contact:" + contact.GetFixtureA().GetBody().GetUserData());

  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();
};
listener.EndContact = function (contact) {
  //console.log("End Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.PostSolve = function (contact, impulse) {
  //   console.log(
  //     fixA + " hits " + fixB + "with impulse " + impulse.normalImpulses[0]
  //   );
  let fixA = contact.GetFixtureA().GetBody().GetUserData().id;
  let fixB = contact.GetFixtureB().GetBody().GetUserData().id;
};
listener.PreSolve = function (contact, oldManifold) {};
world.SetContactListener(listener);

/*****
 * Keyboard Controls
 */

/*****
 * Mouse Controls
 */

let cutActive = false;

let startX = null;
let startY = null;

$("#b2dcan").mousedown(function (e) {
  cutActive = true;
});

$("#b2dcan").mouseup(function (e) {
  cutActive = false;

  startX = null;
  startY = null;
});

$("#b2dcan").mousemove(function (e) {
  if (cutActive) {
    console.log("Cut!");

    if (startX == null) {
      startX = e.offsetX;
      startY = e.offsetY;
    } else {
      lineCollision(startX, startY, e.offsetX, e.offsetY);
    }

    // let mouseX = e.offsetX;
    // let mouseY = e.offsetY;

    // let circleRadius = 10;

    // circleCollision(mouseX, mouseY, circleRadius);
  }
});
