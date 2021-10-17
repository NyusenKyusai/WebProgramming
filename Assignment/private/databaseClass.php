<?php
require_once("dbValues.php");

class Database {
	private $_connection; // Stores the connection
	private static $_instance; // Store the single instance.
	
	public static function getInstance() {
		// If statement that creates a new version of the instance if there isn't one that exists
		if (!self::$_instance) {
			self::$_instance = new self();
		}
		// Returns the instance to where the function was called
		return self::$_instance;
	}
	
	public function __construct() {
		// Sets the connection variable with the necessary information for connecting to the database
		$this->_connection = new MySQLi(dbhost, dbuser, dbpass, dbname);
		// Error Handling.
		if (mysqli_connect_error()) {
			trigger_error('Failed to connect to MySQL: ' . mysqli_connect_errno(), E_USER_ERROR);
		}
	}
	
	private function __clone() {}
	
	// Gets the connection for the user
	public function getConnection() {
		return $this->_connection;
	}
	
	// Function for disconnecting from the database
	public function dbDisconnect($_connection) {
		if (isset($_connection)) {
			mysqli_close();
		}
	}
	
	// Escapes difficult values from user input before it goes into the database
	
	public function dbEscape($_connection, $string) {
		return mysqli_real_escape_string($_connection, $string);
	}
	
	public function assocUsername($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT * FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	public function usernameID($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT userID FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	public function usernameIDOAuth($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT userID FROM OAuthUsers WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	public function rowsUsername($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT * FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_num_rows($query);
		
		return $result;
	}
	
	public function rowsUsernameOAuth($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT * FROM OAuthUsers WHERE username = '$escapeUsername';" );
		$result = mysqli_num_rows($query);
		
		return $result;
	}
	
	public function insertIntoUsers($conn, $username, $hash){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO users ";
		$sql .= "(username, password) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $username) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $hash) . "'";
		$sql .= ");";
		
		//echo $sql;
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function insertIntoUsersOAuth($conn, $username, $provider){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO OAuthUsers ";
		$sql .= "(username, provider) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $username) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $provider) . "'";
		$sql .= ");";
		
		//echo $sql;
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function insertIntoHighScores($conn, $userID, $highscore){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO highScores ";
		$sql .= "(userID, bestRun) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $userID) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $highscore) . "'";
		$sql .= ");";
		
		//echo $sql;
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function insertIntoOAuthHighScores($conn, $userID, $highscore){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO OAuthHighScores ";
		$sql .= "(userID, bestRun) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $userID) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $highscore) . "'";
		$sql .= ");";
		
		echo $sql;
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function findAccountDetailsByUsername($conn, $username) {
		// Creating SQL query statement
		$sql = "SELECT * FROM users ";
		$sql .= "WHERE username = '" . $this->dbEscape($conn, $username) . "';";
		// Querying database and fetching the results
		$result = mysqli_query($conn, $sql);
		$user = mysqli_fetch_assoc($result);
		
		return $user;
		
	}
	
	public function findIDbyUsername($conn, $username) {
		// Creating SQL query statement
		$sql = "SELECT userID FROM users ";
		$sql .= "WHERE username = '" . $this->dbEscape($conn, $username) . "';";
		
		$result = mysqli_query($conn, $sql);
		$userID = mysqli_fetch_assoc($result);
		
		return $userID['userID'];
	}
}
?>