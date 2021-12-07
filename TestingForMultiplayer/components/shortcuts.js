/****
 * BOX2DWEB Definitions
 */

// Creating variables and setting the Box2d Objects to them so it becomes easier to access
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
let joint = new Box2D.Dynamics.Joints.b2DistanceJointDef();

// Exporting all the variables
export {
  b2Vec2,
  b2BodyDef,
  b2Body,
  b2FixtureDef,
  b2Fixture,
  b2World,
  b2MassData,
  b2PolygonShape,
  b2CircleShape,
  b2DebugDraw,
  joint,
};
