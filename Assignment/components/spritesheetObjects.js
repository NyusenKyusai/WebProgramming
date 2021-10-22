// Attempted to create a separate object file to call in as a module but it created errors where GET method was not found as it bypassed the loader
// Scrapped it

//prettier-ignore
// Creating the player spritesheet
let playerSpritesheet = new createjs.SpriteSheet({
  // Setting the framerate
  "framerate": 60,
  // Setting absolute path to the spritesheet png
  "images": ["./assets/easel/spritesheet_player.png"],
  // Setting the frames in the sprite sheet as well as their dimensions
  "frames": [
    [1, 1, 23, 32, 0, 11.5, 32],
    [1, 35, 17, 32, 0, 8.5, 32],
    [1, 69, 32, 30, 0, 16, 30],
    [20, 35, 16, 32, 0, 8, 32],
    [26, 1, 16, 32, 0, 8, 32],
    [35, 69, 16, 31, 0, 8, 31],
  ],
  // Creating the animations as well as their corresponding frames
  "animations": {
    // Stand animation with one frame
    "stand": { "frames": [5] },
    // Run animation with 4 frames and 0.25 speed
    // Speed doesn't seem to have a tangible affect of the animation
    "run": { "frames": [1, 5, 3, 4], "speed": 0.25 },
    // Attack animation with 2 frames and 0.05 speed
    "attack": { "frames": [0, 2], "speed": 0.05 },
  },
  // I used TexturePackerGUI to create the correct spritesheets. Attempted creating it personally and it was almost impossible
  "texturepacker": [
    "SmartUpdateHash: $TexturePacker:SmartUpdate:17baabe56ed864e1274376ba31c68dfa:75aee0be487f804f29cae7954f09ab6b:5fca50be405cbd4bd273a8b2f02a084c$",
    "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
  ],
});
//prettier-ignore
let orcSpritesheet = new createjs.SpriteSheet({
  // Setting the framerate
  "framerate": 20,
  // Setting absolute path to the spritesheet png
  "images": ["./assets/easel/orc.png"],
  // Setting the frame in the sprite sheet as well as their dimensions
  "frames": [[1, 1, 83, 131, 0, 42, 131]],
  // Creating the animation as well as their corresponding frame
  "animations": {
    "orc": { "frames": [0] },
  },
  // I used TexturePackerGUI to create the correct spritesheets. Attempted creating it personally and it was almost impossible
  "texturepacker": [
    "SmartUpdateHash: $TexturePacker:SmartUpdate:501c1b0c1f3f971482355c9c3bd641a9:9b238b59ac5ed5233bae41ba00a09fea:8d2f034a042f5e42d835b3511e9c1732$",
    "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
  ],
});
//prettier-ignore
let slimeSpritesheet = new createjs.SpriteSheet({
  // Setting the framerate
  "framerate": 20,
  // Setting absolute path to the spritesheet png
  "images": ["./assets/easel/slime.png"],
  // Setting the frame in the sprite sheet as well as their dimensions
  "frames": [[1, 1, 18, 14, 0, 9, 14]],
  "animations": {
    "slime": { "frames": [0] },
  },
  // I used TexturePackerGUI to create the correct spritesheets. Attempted creating it personally and it was almost impossible
  "texturepacker": [
    "SmartUpdateHash: $TexturePacker:SmartUpdate:913e1b47e1f7640b11d314cf41a74cc3:8d759e34bfe2cdfff75e3cfbdb7725b3:5969a7bd39dc609f49b3bb3f3e71107a$",
    "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
  ],
});
//prettier-ignore
let bossSpritesheet = new createjs.SpriteSheet({
  // Setting the framerate
  "framerate": 20,
  // Setting absolute path to the spritesheet png
  "images": "./assets/easel/boss.png",
  // Setting the frame in the sprite sheet as well as their dimensions
  "frames": [[1, 1, 16, 42, 0, 8, 42]],
  // Creating the animation as well as their corresponding frame
  "animations": {
    "boss": { "frames": [0] },
  },
  // I used TexturePackerGUI to create the correct spritesheets. Attempted creating it personally and it was almost impossible
  "texturepacker": [
    "SmartUpdateHash: $TexturePacker:SmartUpdate:c20cfdc1ff0b508ce6316fdff18b22e2:e8473474efd48dadc9c8230c17880405:46ed12eff2905e238af2d2a3f055c310$",
    "Created with TexturePacker (https://www.codeandweb.com/texturepacker) for EaselJS",
  ],
});

// Exporting the 4 spritesheets to be used in gameLogic.js
export { playerSpritesheet, orcSpritesheet, slimeSpritesheet, bossSpritesheet };
