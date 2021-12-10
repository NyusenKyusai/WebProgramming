// Importing the Box2D Shortcuts
import * as shortcut from "./shortcuts.js";

// Main class for creating Box2D bodies
class defineBody {
  // Userdata object
  userdata = {};
  uniquename;
  // Fixture Definitions
  fixDef = new shortcut.b2FixtureDef();
  // Body Definitions
  bodyDef = new shortcut.b2BodyDef();
  // Variable that holds the object that is created
  b2dobj;
  // Constructer for the class
  constructor(density, friction, restitution, x, y, scale) {
    // Assigning constructor variables to the class variables
    this.fixDef.density = density;
    this.fixDef.friction = friction;
    this.fixDef.restitution = restitution;
    this.bodyDef.position.x = x / scale;
    this.bodyDef.position.y = y / scale;
  }

  // Method that takes the world object and creates the body and the fixture and adds it to the world
  createObj(world) {
    // Sets the body in the world to the object variable
    this.b2dobj = world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
  }

  // Method that changes the Userdata object in the body
  changeUserData(property, newValue) {
    // Gets the userdata from the body using the GetBody() function
    let objdata = this.GetBody().GetUserData();
    // If objdata is either undefined or null, it becomes an empty object, otherwise it returns the userdata
    this.userdata =
      typeof objdata === undefined || objdata === null ? {} : this.userdata;
    // Setting the new user data property to the new value
    this.userdata[property] = newValue;
    // Setting the user data of the body to the userdata variable
    this.GetBody().SetUserData(this.userdata);
  }

  // Returning the b2dweb object's body
  GetBody() {
    return this.b2dobj.GetBody();
  }
}

// Static Body class for creating Box2D static bodies extended from the main class
class defineSB extends defineBody {
  constructor(
    density,
    friction,
    restitution,
    x,
    y,
    width,
    height,
    objid,
    uniquename,
    angle,
    scale,
    world
  ) {
    //Getting the main class's assignments that all bodies have
    super(density, friction, restitution, x, y, scale, world);
    // Setting type of body to static as well as the angle of the body
    this.bodyDef.type = shortcut.b2Body.b2_staticBody;
    this.bodyDef.angle = angle;
    // Setting the shape of the fixture as well as it's width and height
    this.fixDef.shape = new shortcut.b2PolygonShape();
    this.fixDef.shape.SetAsBox(width / scale, height / scale);
    // Creating the object and setting it into the world
    this.createObj(world);
    // Assigning the userdata of the object to the id, uniquename, and level it belongs to
    this.changeUserData("id", objid);
    this.changeUserData("uniquename", uniquename);
  }
}

// Dynamic Body class for creating Box2D dynamic bodies extended from the main class
class defineDB extends defineBody {
  constructor(
    density,
    friction,
    restitution,
    x,
    y,
    width,
    height,
    objid,
    uniquename,
    scale,
    world
  ) {
    //Getting the main class's assignments that all bodies have
    super(density, friction, restitution, x, y, scale, world);
    // Setting type of body to static
    this.bodyDef.type = shortcut.b2Body.b2_dynamicBody;
    // Setting the shape of the fixture as well as it's width and height
    this.fixDef.shape = new shortcut.b2PolygonShape();
    this.fixDef.shape.SetAsBox(width / scale, height / scale);
    // Creating the object and setting it into the world
    this.createObj(world);
    // Assigning the userdata of the object to the id, uniquename, and level it belongs to
    this.changeUserData("id", objid);
    this.changeUserData("uniquename", uniquename);
  }
}

class defineDCB extends defineBody {
  constructor(
    density,
    friction,
    restitution,
    x,
    y,
    r,
    objid,
    uniquename,
    scale,
    world
  ) {
    super(density, friction, restitution, x, y, scale, world);
    this.bodyDef.type = shortcut.b2Body.b2_dynamicBody;
    this.fixDef.shape = new shortcut.b2CircleShape(r / scale);
    this.createObj(world);
    this.changeUserData("id", objid);
    this.changeUserData("uniquename", uniquename);
  }
}

// Exporting the two classes
export { defineSB, defineDB, defineDCB };
