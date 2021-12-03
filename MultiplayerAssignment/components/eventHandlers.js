"use strict";

// Setting the variable to a shortcut
let b2Listener = new Box2D.Dynamics.b2ContactListener();

// Initializing the contact and collision variables
b2Listener.BeginContact = (contact) => {};
b2Listener.EndContact = (contact) => {};
b2Listener.PostSolve = (contact, Impulse) => {};
b2Listener.PreSolve = (contact, oldManifold) => {};

/*****
 * Mouse Controls class
 */

class mouseHandler {
  // Takes the target click, the type of event, and the function that should be run
  constructor(target, type, runFunction) {
    // Adding an event listener to the target and setting it's type
    target.addEventListener(type, (e) => {
      // Running the callback function and passing the event to it
      runFunction(e);
    });
  }
}

/*****
 * Keyboard Controls class
 */

class keyboardHandler {
  // Takes the keydown, the type of event, and the function that should be run
  constructor(type, runFunction) {
    // Adding an event listener to the DOM and setting it's type
    document.addEventListener(type, (e) => {
      // Running the callback function and passing the event to it
      runFunction(e);
    });
  }
}

// Exporting the two event handlers as well as the contact listener variable
export { b2Listener, mouseHandler, keyboardHandler };
