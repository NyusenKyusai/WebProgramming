<?php session_start() ?>

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="./css/style.css">
<title>Home Page</title>
</head>

<body>
	<nav>
		<ul id="logoBar">
			<li class="nav" style="float: left"><a href="index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="game.php">Play!</a></li>
			<?php
			if (isset($_SESSION['username'])) {
				echo '<li class="nav"><a href="./private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			} else {
				echo '<li class="nav"><a href="./php/registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="./php/loginUser.php">Login</a></li>';
			}
			?>
		</ul>
	</nav>
</body>
</html>