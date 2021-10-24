<?php 
// Commands to make the server give the user real errors from php to troubleshoot
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);
// Starting Session
session_start(); 

// Linking the page to the database page
require_once('./private/databaseClass.php');

// Calling function from database page
$db = new Database();
$conn  = $db->getConnection();

//var_dump($_COOKIE);

if (isset($_SESSION['username'])) {
    if (isset($_SESSION["OAuth"])) {
        $userID = $db->usernameIDOAuth($conn, $_SESSION['username']);

        $result = $db->updateOAuthHighScores($conn, $userID["userID"], $_COOKIE['seconds'], $_COOKIE['minutes'], $_COOKIE['hours']);

        //var_dump($result);
    } else {

        $userID = $db->usernameID($conn, $_SESSION["username"]);

        $result = $db->updateHighScores($conn, $userID["userID"], $_COOKIE['seconds'], $_COOKIE['minutes'], $_COOKIE['hours']);
    }
}




?>

<!DOCTYPE html>
<head>
	<!-- Link to the CSS style sheet -->
	<link rel="stylesheet" href="./css/style.css">
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
	<!-- Container that holds the info in a page and puts it into a card -->
	<div id="Container">
		<!-- Section that holds the title of the page -->
		<section class="child" id="title">
			<h2>You Win!</h2>
		</section>
		<!-- Section that holds the title of the page -->
		<section class="child" id="paragraph">
			<?php
                echo "<h1>Your Run:</br> " . $_COOKIE['hours'] . ":" . $_COOKIE['minutes'] . ":" .  $_COOKIE['seconds'] . "</h1>";
            ?>
		</section>
	</div>
</body>
</html>