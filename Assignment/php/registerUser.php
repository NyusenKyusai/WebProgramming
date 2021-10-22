<?php 

// Starts the session
session_start(); 

?>

<!DOCTYPE html>
<head>
<meta charset="utf-8">
<title>Register</title>
<!-- Link to the CSS style sheet -->
<link href="../css/style.css" rel="stylesheet" type="text/css">
</head>

<body>
	<nav>
		<!-- UL that holds the navigation bar -->
		<ul id="logoBar">
			<!-- Link to index.php and the game.php pages -->
			<li class="nav" style="float: left"><a href="../index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="../game.php">Play!</a></li>
			<?php
			// If statement that determines if the username is set in the session
			if (isset($_SESSION['username'])) {
				// If it is set it shows the user the avatar as well as a logout button
				echo '<li class="nav"><a href="./private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			// If it is not set, it shows the user a link to register an account or log is
			} else {
				echo '<li class="nav"><a href="registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="loginUser.php">Login</a></li>';
			}
			?>
		</ul>
	</nav>
	<!-- Container that holds the info in a page and puts it into a card -->
	<div class="container" id="Container">
		<!-- Section that holds the title of the page -->
		<section class="child" id="title">
			<h2>Create a New Account</h2>
		</section>
		<!-- Section that holds the title of the page -->
		<section class="child" id="paragraph">
			<!-- Form that handles the login of the user and posts it to the php handler -->
			<form action="../private/registerHandle.php" method="post" onSubmit="return checkForm(this)">
				Username: <br><input type="text" name="username" required><br>
				Password: <br><input type="text" name="password" required><br>
				<br><input type="submit" value="Register" name="submit" id="button"><br>
			</form><br>
			<!-- Hyperlink to the loginUser php -->
			<a href="loginUser.php">Log in?</a>
		</section>
	</div>
</body>
</html>