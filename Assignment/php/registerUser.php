<?php session_start(); ?>

<!DOCTYPE html>
<head>
<meta charset="utf-8">
<title>Register</title>
<link href="../css/style.css" rel="stylesheet" type="text/css">
</head>

<body>
	<nav>
		<ul id="logoBar">
			<li class="nav" style="float: left"><a href="../index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="../game.php">Play!</a></li>
			<?php
			if (isset($_SESSION['username'])) {
				echo '<li class="nav"><a href="./private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			} else {
				echo '<li class="nav"><a href="registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="loginUser.php">Login</a></li>';
			}
			?>
		</ul>
	</nav>
	<div class="container" id="Container">
		<section class="child" id="title">
			<h2>Create a New Account</h2>
		</section>
		<section class="child" id="paragraph">
			<form action="../private/registerHandle.php" method="post" onSubmit="return checkForm(this)">
				Username: <br><input type="text" name="username" required><br>
				Password: <br><input type="text" name="password" required><br>
				<br><input type="submit" value="Register" name="submit" id="button"><br>
			</form><br>
			<a href="loginUser.php">Log in?</a>
		</section>
	</div>
</body>
</html>