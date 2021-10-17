import * as handlers from "./components/eventHandlers.js";
import LoZGame from "./components/gameLogic.js";

let mygame = new LoZGame(600, 1800, 30, 0, 9.81, 60, "b2dcan");
mygame.setupDebugDraw();
mygame.getData("./components/gameData.json", 1);

mygame.addKeyboardHandler("keydown", mygame.handleKeyDown);
mygame.addKeyboardHandler("keyup", mygame.handleKeyUp);

let LoZContact = handlers.b2Listener;

LoZContact.PostSolve = (contact, impulse) => {
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  let isPlayer = false;
  let otherCollision = false;
  let playerUserData;

  if (fixA.id == "player" && !mygame.collisionList.includes(fixB.id)) {
    isPlayer = contact.GetFixtureA();
    otherCollision = contact.GetFixtureB();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixA.uniquename) {
        playerUserData = item;
      }
    });
  }

  if (fixB.id == "player" && !mygame.collisionList.includes(fixA.id)) {
    otherCollision = contact.GetFixtureA();
    isPlayer = contact.GetFixtureB();
    mygame.itemList.forEach((item) => {
      if (item.userdata.uniquename == fixB.uniquename) {
        playerUserData = item;
      }
    });
  }

  if (fixA.id == "player" && fixB.id == "sensor") {
    mygame.itemList.forEach((item) => {
      mygame.destroylist.push(item.GetBody());
    });

    mygame.itemList.length = 0;

    mygame.spawn(fixB.uniquename);
    //mygame.getData("./components/gameData.json", 2);
  }

  if (fixB.id == "player" && fixA.id == "sensor") {
    mygame.itemList.forEach((item) => {
      mygame.destroylist.push(item.GetBody());
    });

    mygame.itemList.length = 0;

    mygame.spawn(fixA.uniquename);
    //mygame.getData("./components/gameData.json", 2);
  }

  //console.log(mygame.getInvisible());

  if (isPlayer != false) {
    if (!mygame.getInvisible() && impulse.normalImpulses[0] > 0) {
      let currentHealth = isPlayer.GetBody().GetUserData().health;

      currentHealth -= 1;

      //console.log(otherCollision.GetBody());

      mygame.setInvisible(true);
      mygame.setAllowMove(false);

      let distance = mygame.getDistance(isPlayer, otherCollision);
      let direction = mygame.getDirection(distance);

      //console.log(direction);

      mygame.setLinearVelocity(isPlayer, 0, 0);

      mygame.applyImpulse(direction, isPlayer, 10, -25);

      setInterval(function () {
        mygame.setInvisible(false);
      }, 1000);

      setInterval(function () {
        mygame.setAllowMove(true);
      }, 300);

      if (currentHealth <= 0) {
        window.location.href = "gameOver.php";
      } else {
        playerUserData.changeUserData("health", currentHealth);
      }
    }
  }
};

mygame.world.SetContactListener(LoZContact);
