class defineBody {
  userdata = {};
  uniquename;
  fixDef = new b2FixtureDef();
  bodyDef = new b2BodyDef();
  b2dobj;
  constructor(density, friction, restitution, x, y, scale) {
    this.fixDef.density = density;
    this.fixDef.friction = friction;
    this.fixDef.restitution = restitution;
    this.bodyDef.position.x = x / scale;
    this.bodyDef.position.y = y / scale;
  }

  createObj(world) {
    this.b2dobj = world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
  }

  changeUserData(property, newValue) {
    let objdata = this.GetBody().GetUserData();
    this.userdata =
      typeof objdata === undefined || objdata === null ? {} : this.userdata;
    this.userdata[property] = newValue;
    this.GetBody().SetUserData(this.userdata);
  }

  GetBody() {
    return this.b2dobj.GetBody();
  }
}

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
    super(density, friction, restitution, x, y, scale, world);
    this.bodyDef.type = b2Body.b2_staticBody;
    this.bodyDef.angle = angle;
    this.fixDef.shape = new b2PolygonShape();
    this.fixDef.shape.SetAsBox(width / scale, height / scale);
    this.createObj(world);
    this.changeUserData("id", objid);
    this.changeUserData("uniquename", uniquename);
  }
}

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
    super(density, friction, restitution, x, y, scale, world);
    this.bodyDef.type = b2Body.b2_dynamicBody;
    this.fixDef.shape = new b2PolygonShape();
    this.fixDef.shape.SetAsBox(width / scale, height / scale);
    this.createObj(world);
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
    this.bodyDef.type = b2Body.b2_dynamicBody;
    this.fixDef.shape = new b2CircleShape(r / scale);
    this.createObj(world);
    this.changeUserData("id", objid);
    this.changeUserData("uniquename", uniquename);
  }
}
