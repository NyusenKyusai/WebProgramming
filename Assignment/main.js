import * as handlers from "./components/eventHandlers.js";
import LoZGame from "./components/gameLogic.js";

let mygame = new LoZGame(600, 900, 30, 0, 9.81, 60, "b2dcan");
mygame.setupDebugDraw();
mygame.getData("./components/gameData.json");

mygame.addKeyboardHandler("keydown", mygame.handleKeyDown);
mygame.addKeyboardHandler("keyup", mygame.handleKeyUp);

let AngryContact = handlers.b2Listener;

AngryContact.PostSolve = (contact, impulse) => {
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  let isPig = false;
  let pigparent;

  if (fixA.id == "pig") {
    isPig = contact.GetFixtureA();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixA.uniquename) {
        pigparent = item;
      }
    });
  }

  if (fixB.id == "pig") {
    isPig = contact.GetFixtureB();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixB.uniquename) {
        pigparent = item;
      }
    });
  }

  if (isPig != false) {
    if (impulse.normalImpulses[0] > 0.5) {
      let currentHealth = isPig.GetBody().GetUserData().health;

      currentHealth -= impulse.normalImpulses[0] * 5;

      if (currentHealth <= 0) {
        mygame.destroylist.push(isPig.GetBody());
      } else {
        pigparent.changeUserData("health", currentHealth);
      }
    }
  }
};

mygame.world.SetContactListener(AngryContact);
