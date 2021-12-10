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

mygame.addMouseHandler(
  // Setting the target of the mouseclick to the b2can
  document.getElementById("b2dcan"),
  "mousedown",
  mygame.handleMouseDown
);

// Setting LoZ contact to the b2Listener
const racerContact = handlers.b2Listener;

// Calling PostSolve to handle collisions
racerContact.PostSolve = (contact, impulse) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();
};

racerContact.BeginContact = (contact) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  if (fixA.id == "player" && fixB.id == "sensor") {
    if (fixB.uniquename == "start") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      let condition = mygame.player[index].moveObject.start;

      if (condition) {
        mygame.player[index].moveObject.start = false;
      } else {
        mygame.player[index].moveObject.start = true;
      }

      //console.log(mygame.player[index].moveObject.start);
    }
    if (fixB.uniquename == "finish") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      let condition = mygame.player[index].moveObject.finish;

      if (condition) {
        mygame.player[index].moveObject.finish = false;
      } else {
        mygame.player[index].moveObject.finish = true;
      }

      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        mygame.podium.push(fixA.uniquename);
      }

      //console.log(mygame.player[index].moveObject.finish);
    }

    if (fixB.uniquename == "powerUp") {
      let index = mygame.findPlayer(mygame.player, fixA.uniquename);

      if (!mygame.player[index].moveObject.item) {
        mygame.getItem(mygame.player[index]);
      }
    }
  } else if (fixB.id == "player" && fixA.id == "sensor") {
    if (fixA.uniquename == "start") {
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      let condition = mygame.player[index].moveObject.start;

      if (condition) {
        mygame.player[index].moveObject.start = false;
      } else {
        mygame.player[index].moveObject.start = true;
      }

      //console.log(mygame.player[index].moveObject.start);
    }
    if (fixA.uniquename == "finish") {
      let index = mygame.findPlayer(mygame.player, fixB.uniquename);

      let condition = mygame.player[index].moveObject.finish;

      if (condition) {
        mygame.player[index].moveObject.finish = false;
      } else {
        mygame.player[index].moveObject.finish = true;
      }

      if (
        mygame.player[index].moveObject.start &&
        mygame.player[index].moveObject.finish
      ) {
        mygame.podium.push(fixB.uniquename);
      }

      //console.log(mygame.player[index].moveObject.finish);
    }
  }
  if (fixA.uniquename == "powerUp") {
    let index = mygame.findPlayer(mygame.player, fixA.uniquename);

    if (!mygame.player[index].moveObject.item) {
      mygame.getItem(mygame.player[index]);
    }
  }
};

// Setting the contact listener of the world object to LoZContact
mygame.world.SetContactListener(racerContact);
