<?php
session_start();
// Display errors to help with fixing errors
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

// Linking the page to the database page
require_once('databaseClass.php');

// Saving username for testing if the username is taken
$username = $_POST['username'];

// Calling function from database page
$db = new Database();
$conn  = $db->getConnection();

if(isset($_POST['submit'])) {
	// Querying database and saving result
	$result = $db->rowsUsername($conn, $username);
	
	//$row = mysqli_num_rows($result);
	
	//echo $result;
	
	//Determining whether the usrname is already in database
	if ($result > 0) {
		echo "Username Taken";
		// Redirecting to register User page
		header("Location: " . "../php/registerUser.php");
		die();
	} else {
		// Saving data from post
		$password = $_POST['password'];
		
		
		// Hashing the password
		$hash = password_hash($password, PASSWORD_DEFAULT);
		echo $hash;
		// Inserting the new user into the user table allong with the password
		$result = $db->insertIntoUsers($conn, $username, $hash);
		// Getting the userID from the username
		$userID = $db->usernameID($conn, $username);
		// Inserting 0 into the high scores table using the user id
		$highscoreResult = $db->insertIntoHighScores($conn, $userID['userID'], "00", "00","00");
		
		echo $result;
		// If statement that allows the programmer to have an easier time to troubleshoot sql
		if ($result) {
			//Redirecting to main page
			header("Location: " . "../index.php");
			die();
		} else {
			echo $sql;
			exit;
		}
	}
	
} else {
	// Redirecting to login page
	header("Location: " . "../php/loginUser.php");
	die();
}

?>