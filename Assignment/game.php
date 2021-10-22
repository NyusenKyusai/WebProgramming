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


?>

<!DOCTYPE html>
<head>
	<!-- Link to the CSS style sheet -->
	<link rel="stylesheet" href="./css/style.css">
	<!-- Link to the Box2DWeb script and defering it -->
    <script src="./components/Box2dWeb-2.1.a.3.min.js" defer></script>
	<!-- Link to the JQuery CDN and defering it -->
    <script
        src="https://code.jquery.com/jquery-3.6.0.js"
        integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
        crossorigin="anonymous" defer>
    </script>
	<!-- Link to the EaselJS CDN and defering it -->
	<script src="https://code.createjs.com/1.0.0/easeljs.min.js" defer></script>
    <script src="https://code.createjs.com/1.0.0/preloadjs.min.js" defer></script>
    <!-- Link to the mainBox2D script as a module and defering it -->
	<script type="module" src="./mainBox2D.js" defer></script>
	<!-- Box2DCanvas CSS style -->
    <style>
        #b2dcan {background-color: #000; user-select: none;}
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
				echo '<li class="nav"><a href="./private/logoutUser.php">Log Out</a></li>';
				echo '<li class="nav"><img src ="' . $_SESSION['avatar'] . '" width="34" height="34"></li>';
			// If it is not set, it shows the user a link to register an account or log is
			} else {
				echo '<li class="nav"><a href="./php/registerUser.php">Register</a></li>';
				echo '<li class="nav"><a href="./php/loginUser.php">Login</a></li>';
			}
			?>
		</ul>
		<!-- UL that holds the navigation bar for the best runs and current run-->
		<ul id="logoBar">
			<?php
			// If statement that determines whether a user is signed in or not
			if (isset($_SESSION['username'])) {
				// Gets the username from the session
				$username = $_SESSION['username'];
				// If statement that handles code whether it is an OAuth login or not
				if (isset($_SESSION['OAuth'])) {
					// Echos the Best run and the current run
					// Gets the Best run from the highscore table from the OAuth
					echo '<li class="nav">Best Run: ' . $db->getBestRunOauth($conn, $username) . '</li>';
					echo '<li class="nav">Current Run: Oauth</li>';
				} else {
					// Echos the Best run and the current run
					// Gets the Best run from the highscore table
					echo '<li class="nav">Best Run: ' . $db->getBestRun($conn, $username) . '</li>';
					echo '<li class="nav">Current Run: Normal</li>';
				}
			} else {
				// Sets Best Run to 0 and the current run
				echo '<li class="nav">Best Run: 0</li>';
				echo '<li class="nav">Current Run: 0</li>';
			}
			?>
		</ul>
	</nav>
	<br><br>
	<!-- Creates the box2dcan canvas -->
    <canvas id="b2dcan" width="1800" height="600">

    </canvas>
</body>
</html>