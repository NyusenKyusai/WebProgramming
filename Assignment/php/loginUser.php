<?php
	// Commands to make the server give the user real errors from php to troubleshoot
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);
	// Starting Session
	session_start();
	// Calling the OAuth class to handle OAuth
    require_once("OAuth.class.php");
	// Calling the ProviderHandler class and the addProvider methods to add the three providers 
    $handler = new ProviderHandler();
    $handler->addProvider("Discord", "896813766199623691", "aQkRp6pNX38cPGJrO3cKJFqe5qK0G06o");
    $handler->addProvider("GitHub", "d3ca7278fd708fbd107a", "fffef7faacbdad87502e388524a9587fd968c158");
    $handler->addProvider("Reddit", "zrDCWxIleBDANuU30Bx27Q", "W4LSmHGrkIYGzs25qtv7jXnkGKSbWw");
	// Calling the performAction method
    $handler->performAction();
    //var_dump($handler);
?>
<!DOCTYPE html>
<head>
<title>Login</title>
<!-- Link to the CSS style sheet -->
<link rel="stylesheet" href="../css/style.css">
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
				echo '<li class="nav"><a href="../private/logoutUser.php">Log Out</a></li>';
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
	<div id="Container">
		<!-- Section that holds the title of the page -->
		<section class="child" id="title">
			<h2>Login</h2>
		</section>
		<!-- Section that holds the title of the page -->
		<section class="child" id="paragraph">
			<!-- Form that handles the login of the user and posts it to the php handler -->
			<form action="../private/loginHandle.php" method="post">
				Username: <br><input type="text" name="username" required><br>
				Password: <br><input type=password name="password" required><br>
				<br><input type="submit" value="Log In" id="button" name="submit"><br>
			</form>
			<!-- Section of the login that holds and handles OAuth login -->
			<p>OAuth</p>
			<?php
				// if the handler status is logged out or null
				if ($handler->status == "logged out" || $handler->status == null) {
					// Echo's out the generateLoginText method to the html
					echo "<ul id='OAuthMenu'>";
					echo $handler->generateLoginText();
					echo "</ul>";
				// If statement when the status is not logged out
				}else if ($handler->status != "logged out") {
					// Generates the logout() text
					echo $handler->generateLogout();
				}

				// If statement that handles the redirect from the redirect provider
				if ($handler->status == "logged in") {
					// Sets the session values for the OAuth, provider, username, and avatar
					$_SESSION['OAuth'] = "true";
					$_SESSION['provider'] = $handler->providerInstance->providerName;
					$_SESSION['username'] = $handler->providerInstance->getName();
					$_SESSION['avatar'] = $handler->providerInstance->getAvatar();
					// Redirects to the OAuth handler and kills the page
					header("Location: " . "../private/OAuthHandle.php");
					die();
				}
			?>
		</section>
	</div>
</body>