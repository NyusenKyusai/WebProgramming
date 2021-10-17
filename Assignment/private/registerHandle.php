<?php
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
	
	$row = mysqli_num_rows($result);
	
	//echo $row;
	
	//Determining whether the usrname is already in database
	if ($row > 0) {
		echo "Username Taken";
		// Redirecting to register User page
		header("Location: " . "../php/registerUser.php");
	} else {
		// Saving data from post
		$password = $_POST['password'];
		// Hashing the password
		$hash = password_hash($password, PASSWORD_DEFAULT);
		
		$result = $db->insertIntoUsers($conn, $username, $hash);
		
		if ($result) {
			//Redirecting to main page
			header("Location: " . "../php/index.php");
		} else {
			echo $sql;
			exit;
		}
	}
	
} else {
	// Redirecting to login page
	header("Location: " . "../php/loginUser.php");
}

?>