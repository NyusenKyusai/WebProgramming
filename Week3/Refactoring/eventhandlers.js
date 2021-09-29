"use strict";
let b2Listener = new Box2D.Dynamics.b2ContactListener();
b2Listener.BeginContact = (contact) => {};
b2Listener.EndContact = (contact) => {};
b2Listener.PostSolve = (contact, Impulse) => {};
b2Listener.PreSolve = (contact, oldManifold) => {};

/*****
 * Mouse Controls
 */

class mouseHandler {
  constructor(target, type, runFunction) {
    target.addEventListener(type, (e) => {
      runFunction(e);
    });
  }
}
