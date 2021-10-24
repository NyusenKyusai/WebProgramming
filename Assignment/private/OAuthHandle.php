<?php
session_start();
// Display errors to help with fixing errors
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

// Linking the page to the database page
require_once('databaseClass.php');

// Saving username for testing if the username is taken
$username = $_SESSION['username'];
$provider = $_SESSION['provider'];

// Calling function from database page
$db = new Database();
$conn  = $db->getConnection();

if(isset($_SESSION['OAuth'])) {
	// Querying database and saving result
	$result = $db->rowsUsernameOAuth($conn, $username);
	
	//$row = mysqli_num_rows($result);
	
	//echo $result;
	
	//Determining whether the usrname is already in database
	if ($result > 0) {
		echo "Username Taken";
		// Redirecting to register User page
		header("Location: " . "../index.php");
		die();
	} else {
		// Inserting the username and the provider to the OAuthUsers table
		$result = $db->insertIntoUsersOAuth($conn, $username, $provider);
		// Getting the user id from the inserted username
		$userID = $db->usernameIDOAuth($conn, $username);
		
		//var_dump($userID);
		// Inserting 0 as the best run into the OAuth high scores table
		$highscoreResult = $db->insertIntoOAuthHighScores($conn, $userID['userID'], "00", "00", "00");
		
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