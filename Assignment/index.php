<?php session_start() ?>

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<!-- Link to the CSS style sheet -->
<link rel="stylesheet" href="./css/style.css">
<title>Home Page</title>
</head>

<body>
	<nav>
		<!-- UL that holds the navigation bar -->
		<ul id="logoBar">
			<!-- Link to index.php and the game.php pages -->
			<li class="nav" style="float: left"><a href="index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="game.php">Play!</a></li>
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
</body>
</html>