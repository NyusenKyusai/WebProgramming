// Importing the mouse and keyboard handles as well as the Box2DWeb Implementation Class
import * as handlers from "./components/eventHandlers.js";
import { LoZGame } from "./components/gameLogic.js";
import localStorageClass from "./components/localStorageClass.js";
//import EaselGame from "./components/gameLogic.js";

const localObject = new localStorageClass(3);

let json = localObject.getJSONObject("game");

// Calling the Box2DWeb class and setting it to a variable with on the b2dcan canvas
const mygame = new LoZGame(900, 1800, 30, 0, 0, 60, "b2dcan");
// Calling the setupDebugDraw method
mygame.setupDebugDraw();
// Getting the data and creating the world bodies for level 1
mygame.getData("./components/gameData.json");

mygame.addKeyboardHandler("keydown", mygame.handleKeyDown);
mygame.addKeyboardHandler("keyup", mygame.handleKeyUp);

// Setting LoZ contact to the b2Listener
const LoZContact = handlers.b2Listener;

// Calling PostSolve to handle collisions
LoZContact.PostSolve = (contact, impulse) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  if (fixA) {
  }
};

// Setting the contact listener of the world object to LoZContact
mygame.world.SetContactListener(LoZContact);
