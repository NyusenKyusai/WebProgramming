# **Box2dWeb and Easel JS Assignment**

## How to run the game

Website Link ------ [Index](https://comp-server.uhi.ac.uk/~18018535/ "Game")  
The Navigation bar will lead you to all the accessible pages  
Click Play to start playing the game  
No Highscore will be recorded if the user is not signed in using OAuth or the internal user system  
If the user signs in using OAuth, they will see their avatar on the top right  
Other users have a generic Avatar

## Controls

Move left - A key  
Move right - D key  
Jump - Space Bar  
Attack - Left Mouse Click

## Features

The game has two main Javascript files  
The Box2DWeb file has full implementation. It has localStorage which saves a user's  
progress through the levels. If a user kills all the enemies on a level they will not reappear  
There are three levels, three orcs on level 1, five slimes on level 2, and one boss on level 3  
The orcs and the boss move the same, while the slimes hop  
As soon as the player spawns in a level, all the enemies will move in the direction of the player  
The player has a double jump  
There is a timer that records how fast the player is able to reach level 3 and kill the boss  
The player does not have to kill all the enemies to finish the game  
Once the player beats the boss, they will be redirected to a win screen with  
the speed of the run which will be saved to their account  
The easeljs file has bitmaps and spritesheets for the dynamic and static objects  
The player has animations for stand, run, and attack but changing levels does not work  
THe game crashes as the update function attempts to update the easel positions for the player that no longer  
exists as the update function updates before the player is recreated using the GetData method

## Disclaimers

[TexturePackerGUI](https://www.codeandweb.com/texturepacker/documentation/user-interface-overview "Texture Packer") was used to created the spritesheets and measure the dimensions of each frame  
[Link](https://www.deviantart.com/crookedcartridge/art/Zelda-II-Sprites-297725710 "Link Spritesheet") sprite is a ripped sprite from the Zelda II The Adventure of Link game that was made more easily usable by a user on Deviantart  
[Moblin](https://www.zeldadungeon.net/wiki/images/0/0a/MoblinOrange-Sprite-AOL.png "Moblin") sprite used for the orcs was also ripped from the game that was also made more usable by the Zelda Dungeon wiki site  
[Slime](https://opengameart.org/content/slime-sprite-sheet "Slime") is a spritesheet from OpenGameArt.org and it states in the description that it is under free use  
[HelmetHead](https://www.deviantart.com/splash888/art/Zelda-II-Remake-Bosses-258058708 "Boss") sprite is also from Zelda 2. The png was found on DeviantArt  
[Game Over Screen](https://game-over-dex.fandom.com/wiki/Zelda_II:_The_Adventure_of_Link "Game Over") was also ripped from Zelda 2 but was found on a wiki  
[No Logo](https://www.pngkey.com/detail/u2q8o0o0a9q8w7r5_no-profile-picture-round/ "No logo") was an asset that shows a generaric logo for registered users that did not use OAuth  
[GitHub](https://logoeps.com/github-cat-in-a-circle-icon-vector/65612/ "Github") This asset was used for OAuth login  
[Reddit](https://www.reddit.com/r/cutouts/comments/6q5a6l/can_someone_give_me_a_round_cutout_of_the_reddit/ "Reddit") This asset was used for OAuth login  
[Discord](https://www.pngwing.com/en/free-png-zsdmk "Discord") This asset was used for OAuth login  
[Music](https://www.youtube.com/watch?v=hOSQ1PC7CW0 "Music") This asset was gotten from youtube as creative commons

All assets, especially Zelda 2 sprites, were used under the assumption of free use. Only the art was used, the code is original and it is not meant for sale, only educational purposes
