import localStorageClass from "./localStorageClass.js";

let localObject = new localStorageClass(3);

let object = localObject.getJSONObject("game");

object.level1.array.push("orc1");

object.level3.kills += 1;

localObject.setJSONObject(object);
