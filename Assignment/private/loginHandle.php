<?php
// Display errors to help with fixing errors
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

// Linking the page to the database page
require_once('databaseClass.php');

// Calling function from database page
$db = new Database();
$conn  = $db->getConnection();
// Starting Session
session_start();

// Determining whether user got here from post form
if (isset($_POST['submit'])) {
	// Getting username and password from form
	$username = $_POST['username'];
	$password = $_POST['password'];
	
	// Querying database to see if username exists and getting the results from the database
	$result = $db->assocUsername($conn, $username);
	$rows = $db->rowsUsername($conn, $username);
	
	// Determining whether password from the post form matches the database password
	if (password_verify($password, $result['password']) && $rows == 1) {
		// Creating the session and adding the username to it as well as the Admin Status
		$_SESSION['username'] = $result['username'];
		
		$_SESSION['avatar'] = "assets/php/anonymous.png";
		//Redirecting to the About Us Page
		header('Location: ' . "../index.php");
		die();
	} else {
		// Tells user the password was invalid
		echo "Invalid Password";
	}
} else {
	// Redirecting to login page
	header("Location: " . "../loginUser.php");
	die();
}
?>