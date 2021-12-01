"use strict";

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const Box2D = require("box2dweb-commonjs").Box2D;

let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2AABB = Box2D.Collision.b2AABB;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2Fixture = Box2D.Dynamics.b2Fixture;
let b2World = Box2D.Dynamics.b2World;
let b2MassData = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
let b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
let b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;

let connections = [];
let world;
const SCALE = 30;
const WIDTH = 900;
const HEIGHT = 500;
let size = 50;
let fps = 30;
let interval;

function createAnObject(objid, x, y, dims, iscircle, isstatic) {
  let bodyDef = new b2BodyDef();
  bodyDef.type = isstatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;
  let fixDef = new b2FixtureDef();
  fixDef.density = 1.5;
  fixDef.friction = 0.2;
  fixDef.restitution = 1.0;
  let width, heigth;
  if (iscircle) {
    fixDef.shape = new b2CircleShape(dims.radius / SCALE);
    width = dims.radius * 2;
    heigth = dims.radius * 2;
  } else {
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(dims.width / SCALE, dims.heigth / SCALE);
    width = dims.width;
    heigth = dims.heigth;
  }

  let thisObj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisObj.GetBody().SetUserData({
    id: objid,
    width: width,
    heigth: heigth,
    iscircle: iscircle,
  });

  return thisObj;
}

function drawDOMObjects() {
  let ret = [];

  for (let b = world.GetBodyList(); b; b = b.GetNext()) {
    for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
      let id = f.GetBody().GetUserData().id;
      let x = f.GetBody().GetPosition().x * SCALE;
      let y = f.GetBody().GetPosition().y * SCALE;
      let r = f.GetBody().GetAngle();
      let iscircle = f.GetBody().GetUserData().iscircle;
      let objwidth = f.GetBody().GetUserData().width;
      let objheight = f.GetBody().GetUserData().heigth;

      ret.push({
        id: id,
        x: x,
        y: y,
        r: r,
        iscircle: iscircle,
        objheight: objheight,
        objwidth: objwidth,
      });
    }
  }

  return ret;
}

function update() {
  world.Step(1 / fps, 10, 10);

  io.sockets.emit("objectData", drawDOMObjects());
  world.ClearForces();
}

function init() {
  world = new b2World(new b2Vec2(0, 9.81), true);

  createAnObject("bord", 0, 0, { width: WIDTH, heigth: 5 }, false, true);
  createAnObject("bord", 0, HEIGHT, { width: WIDTH, heigth: 5 }, false, true);
  createAnObject("bord", 0, 0, { width: 5, heigth: HEIGHT }, false, true);
  createAnObject("bord", 0, WIDTH, { width: 5, heigth: HEIGHT }, false, true);

  createAnObject(
    "rand",
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    {
      radius: Math.random() * size,
      heigth: Math.random() * size,
    },
    true,
    false
  );

  createAnObject(
    "rand",
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    {
      radius: Math.random() * size,
      heigth: Math.random() * size,
    },
    false,
    false
  );

  interval = setInterval(function () {
    update();
  }, 1000 / fps);

  update();
}

app.use(express.static("public"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/assets", express.static(__dirname + "public/assets"));

http.listen(8000, function () {
  console.log("server up on *:8000");
  io.on("connection", function (socket) {
    connections.push(socket);
  });
});

init();
