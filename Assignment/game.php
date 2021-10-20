<?php 

ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

session_start(); 

// Linking the page to the database page
require_once('./private/databaseClass.php');

// Calling function from database page
$db = new Database();
$conn  = $db->getConnection();


?>

<!DOCTYPE html>
<head>
	<link rel="stylesheet" href="./css/style.css">
    <script src="./components/Box2dWeb-2.1.a.3.min.js" defer></script>
    <script
        src="https://code.jquery.com/jquery-3.6.0.js"
        integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
        crossorigin="anonymous" defer>
    </script>
    <script type="module" src="./main.js" defer></script>
    <style>
        #b2dcan {background-color: #000; user-select: none;}
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
		<ul id="logoBar">
			<?php
			if (isset($_SESSION['username'])) {
				
				$username = $_SESSION['username'];
				
				if (isset($_SESSION['OAuth'])) {
					echo '<li class="nav">Best Run: ' . $db->getBestRunOauth($conn, $username) . '</li>';
					echo '<li class="nav">Current Run: Oauth</li>';
				} else {
					echo '<li class="nav">Best Run: ' . $db->getBestRun($conn, $username) . '</li>';
					echo '<li class="nav">Current Run: Normal</li>';
				}
			} else {
				echo '<li class="nav">Best Run: 0</li>';
				echo '<li class="nav">Current Run: 0</li>';
			}
			?>
		</ul>
	</nav>
	<br><br>
    <canvas id="b2dcan" width="1800" height="600">

    </canvas>
</body>
</html>