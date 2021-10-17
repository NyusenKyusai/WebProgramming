<?php
// Display errors to help with fixing errors
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);

//Starting session
session_start();

// Determining whether the session exists
if (isset($_SESSION['username'])) {
	// Deleting the session to log out user
	session_unset();
	session_destroy();
	// Redirecting to about us page
	header("Location: " . "../index.php");
} else {
	// Redirecting to about us page
	header("Location: " . "../index.php");
}
?>