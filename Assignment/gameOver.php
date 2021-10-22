<?php 

// Starting Session
session_start(); 

?>

<!DOCTYPE html>
<head>
	<!-- Link to the CSS style sheet -->
	<link rel="stylesheet" href="./css/style.css">
	<!-- CSS Style that puts the image that handles the game over in the center -->
    <style>
        .center {
        display: block;
        margin-left: auto;
        margin-right: auto;
        }
    </style>
</head>
<body>
	<nav>
		<!-- UL that holds the navigation bar -->
		<ul id="logoBar">
			<!-- Link to index.php and the game.php pages -->
			<li class="nav" style="float: left"><a href="./index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="./game.php">Play!</a></li>
			<?php
			// If statement that determines if the username is set in the session
			if (isset($_SESSION['username'])) {
				// If it is set it shows the user the avatar as well as a logout button
				echo '<li class="nav"><a href="./private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			// If it is not set, it shows the user a link to register an account or log is
			} else {
				echo '<li class="nav"><a href="./php/registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="./php/loginUser.php">Login</a></li>';
			}
			?>
		</ul>
	</nav>
	<br><br>
	<!-- Image tag that holds the game over image -->
    <img src="./assets/Zelda_2-0.png" alt="GameOver" class="center" style="width: 40%;">
</body>
</html>