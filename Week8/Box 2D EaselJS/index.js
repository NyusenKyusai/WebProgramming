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
let fps = 65;
let interval;
let keyhit = false;

function createAnObject(objid, x, y, dims, iscircle, isstatic) {
  // prettier-ignore
  let bodyDef = new b2BodyDef;
  bodyDef.type = isstatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;

  // prettier-ignore
  let fixDef = new b2FixtureDef;
  fixDef.density = 1.5;
  fixDef.friction = 0.2;
  fixDef.restitution = 1.0;
  let width, height;
  if (iscircle) {
    fixDef.shape = new b2CircleShape(dims.radius / SCALE);
    width = dims.radius * 2;
    height = dims.radius * 2;
  } else {
    // prettier-ignore
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(dims.width / SCALE, dims.height / SCALE);
    width = dims.width;
    height = dims.height;
  }

  let thisObj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisObj.GetBody().SetUserData({
    id: objid,
    width: width,
    height: height,
    iscircle: iscircle,
  });

  return thisObj;
}

function drawDOMObjects() {
  let ret = [];

  for (let b = world.GetBodyList(); b; b = b.GetNext()) {
    for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
      let id = f.GetBody().GetUserData().id;
      let x = Math.round(f.GetBody().GetPosition().x * SCALE);
      let y = Math.round(f.GetBody().GetPosition().y * SCALE);
      let r = Math.round(f.GetBody().GetAngle() * 100) / 100;

      //console.log(x);

      let iscircle = f.GetBody().GetUserData().iscircle;
      let objwidth = Math.round(f.GetBody().GetUserData().width);
      let objheight = Math.round(f.GetBody().GetUserData().height);

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

  if (keyhit) {
    keyhit = false;
    let applyrandom = false;

    let randomItem = Math.floor(world.GetBodyCount() * Math.random());

    for (let b = world.GetBodyList(); b; b = b.GetNext()) {
      randomItem--;
      for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
        if (randomItem <= 0 && !applyrandom) {
          if (f.GetBody().GetUserData().id == "rand") {
            applyrandom = true;
            f.GetBody().SetLinearVelocity(
              new b2Vec2(Math.random() * 30, Math.random() * 30),
              f.GetBody().GetWorldCenter()
            );
          }
        }
      }
    }
  }

  io.sockets.emit("objectData", drawDOMObjects());
  world.ClearForces();
}

function init() {
  world = new b2World(new b2Vec2(0, 9.81), true);

  createAnObject("bord", 0, 0, { width: WIDTH, height: 5 }, false, true);
  createAnObject("bord", 0, HEIGHT, { width: WIDTH, height: 5 }, false, true);
  createAnObject("bord", 0, 0, { width: 5, height: HEIGHT }, false, true);
  createAnObject("bord", 0, WIDTH, { width: 5, height: HEIGHT }, false, true);

  createAnObject(
    "rand",
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    {
      radius: Math.random() * size,
    },
    true,
    false
  );

  createAnObject(
    "rand",
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    {
      width: Math.random() * size,
      height: Math.random() * size,
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
    socket.on("keypress", (e) => {
      console.log("key hit by " + socket.id);
      keyhit = true;
    });
  });
});

init();
