<?php session_start(); ?>

<!DOCTYPE html>
<head>
	<link rel="stylesheet" href="./css/style.css">
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
		<ul id="logoBar">
			<li class="nav" style="float: left"><a href="./index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="./game.php">Play!</a></li>
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
	<br><br>
    <img src="./assets/Zelda_2-0.png" alt="GameOver" class="center" style="width: 40%;">
</body>
</html>