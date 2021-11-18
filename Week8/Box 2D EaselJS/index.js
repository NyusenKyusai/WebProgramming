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

function createb2dObj(x, y, width, height, isStatic, circle) {
  let bodyDef = new b2BodyDef();
  bodyDef.type = isStatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;

  let fixDef = new b2FixtureDef();
  fixDef.density = 1;
  fixDef.friction = 0.1;
  fixDef.restitution = 1.03;

  if (circle) {
    fixDef.shape = new b2CircleShape(width / SCALE);
  } else {
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
  }

  return world.CreateBody(bodyDef).CreateFixture(fixDef);
}

function createDOMObj(x, y, size, circle, objID) {
  let width = size / 2;
  let height = size / 2;
  let gx = x + width;
  let gy = y + height;

  let body = createb2dObj(gx, gy, width, height, false, circle);
  body.SetUserData({
    domObj: objID,
    width: width,
    height: height,
    circle: circle,
    setup: true,
  });
}

function drawDOMObjects() {
  let ret = [];
  for (let b = world.GetBodyList(); b; b = b.GetNext()) {
    for (let f = b.GetFixtureList(); f; f = f.GetNext()) {
      if (f.GetUserData()) {
        //console.log(f.GetUserData());
        let x = Math.floor(
          f.GetBody().GetPosition().x * SCALE - f.GetUserData().width
        );
        let y = Math.floor(
          f.GetBody().GetPosition().y * SCALE - f.GetUserData().height
        );

        let PI2 = 2 * Math.PI;
        let R2D = 180 / Math.PI;

        let objangle =
          Math.round(((f.GetBody().GetAngle() + PI2) % PI2) * R2D * 100) / 100;
        let transformStr =
          "translate(" + x + "px, " + y + "px) rotate(" + objangle + "deg)";
        let css = {
          "-webkit-transform": transformStr,
          "-moz-transform": transformStr,
          "-ms-transform": transformStr,
          "-o-transform": transformStr,
          transform: transformStr,
        };

        if (f.GetUserData().circle) {
          css["-webkit-border-radius"] =
            css["-moz-border-radius"] =
            css["border-radius"] =
              f.GetUserData().width + "px";
        }
        css["width"] = f.GetUserData().width * 2 + "px";
        css["height"] = f.GetUserData().height * 2 + "px";
        f.GetUserData().setup = false;
        ret.push({ css: css, circle: f.GetUserData().circle });
      }
    }
  }
  return ret;
}

function update() {
  world.Step(1 / fps, 10, 10);

  io.sockets.emit("css", drawDOMObjects());
  world.ClearForces();
}

function init() {
  world = new b2World(new b2Vec2(0, 9.81), true);

  let topwall = createb2dObj(0, 0, WIDTH, 5, true, false);
  let bottomwall = createb2dObj(0, HEIGHT, WIDTH, 5, true, false);
  let leftwall = createb2dObj(0, 0, 5, HEIGHT, true, false);
  let rightwall = createb2dObj(WIDTH, 0, 5, HEIGHT, true, false);

  createDOMObj(
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    Math.random() * 2 * size,
    Math.random() > 0.5,
    "Object1"
  );

  createDOMObj(
    Math.random() * (WIDTH - size),
    Math.random() * (HEIGHT - size),
    Math.random() * 2 * size,
    Math.random() > 0.5,
    "Object2"
  );

  //console.log(rightwall);

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
