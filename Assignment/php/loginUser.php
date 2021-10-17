<?php
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);

	session_start();

    require_once("OAuth.class.php");

    $handler = new ProviderHandler();
    $handler->addProvider("Discord", "896813766199623691", "aQkRp6pNX38cPGJrO3cKJFqe5qK0G06o");
    $handler->addProvider("GitHub", "d3ca7278fd708fbd107a", "fffef7faacbdad87502e388524a9587fd968c158");
    $handler->addProvider("Reddit", "zrDCWxIleBDANuU30Bx27Q", "W4LSmHGrkIYGzs25qtv7jXnkGKSbWw");

    $handler->performAction();
    //var_dump($handler);
?>
<!DOCTYPE html>
<head>
<title>Login</title>
<link rel="stylesheet" href="../css/style.css">
</head>

<body>
	<nav>
		<ul id="logoBar">
			<li class="nav" style="float: left"><a href="../index.php">Home</a></li>
			<li class="nav" style="float: left"><a href="../game.php">Play!</a></li>
			<?php
			if (isset($_SESSION['username'])) {
				echo '<li class="nav"><a href="../private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			} else {
				echo '<li class="nav"><a href="registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="loginUser.php">Login</a></li>';
			}
			?>
		</ul>
	</nav>
	<div id="Container">
		<section class="child" id="title">
			<h2>Login</h2>
		</section>
		<section class="child" id="paragraph">
			<form action="../private/loginHandle.php" method="post">
				Username: <br><input type="text" name="username" required><br>
				Password: <br><input type=password name="password" required><br>
				<br><input type="submit" value="Log In" id="button" name="submit"><br>
			</form>
			<p>OAuth</p>
			<?php
				if ($handler->status == "logged out" || $handler->status == null) {
					echo "<ul id='OAuthMenu'>";
					echo $handler->generateLoginText();
					echo "</ul>";
				}else if ($handler->status != "logged out") {
					echo $handler->generateLogout();
				}

				if ($handler->status == "logged in") {
					$_SESSION['OAuth'] = "true";
					$_SESSION['username'] = $handler->providerInstance->getName();
					$_SESSION['avatar'] = $handler->providerInstance->getAvatar();
					
					header("Location: " . "../index.php");
				}
			?>
		</section>
	</div>
</body>