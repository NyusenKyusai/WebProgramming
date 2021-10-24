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
	
	// Function that returns a associative array containing all the information from the database using the username
	public function assocUsername($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT * FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	// Function that returns the userID from the table using username
	public function usernameID($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT userID FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	// Function that returns the UserID using a username from the OAuthUsers database table
	public function usernameIDOAuth($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT userID FROM OAuthUsers WHERE username = '$escapeUsername';" );
		$result = mysqli_fetch_assoc($query);
		
		return $result;
	}
	
	// Function that returns the number of rows in table from users table that match the username
	public function rowsUsername($conn, $username) {
		$escapeUsername = $this->dbEscape($conn, $username);
		
		$query = mysqli_query($conn, "SELECT * FROM users WHERE username = '$escapeUsername';" );
		$result = mysqli_num_rows($query);
		
		return $result;
	}
	
	// Function that returns the number of rows in table from OAuthUsers table that match the username
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
	
	public function insertIntoHighScores($conn, $userID, $seconds, $minutes, $hours){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO highScores ";
		$sql .= "(userID, seconds, minutes, hours) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $userID) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $seconds) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $minutes) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $hours) . "'";
		$sql .= ");";
		
		//echo $sql;
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function insertIntoOAuthHighScores($conn, $userID, $seconds, $minutes, $hours){
		// Creating the query to insert into the User table
		$sql = "INSERT INTO OAuthHighScores ";
		$sql .= "(userID, seconds, minutes, hours) ";
		$sql .= "VALUES (";
		$sql .= "'" . $this->dbEscape($conn, $userID) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $seconds) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $minutes) . "', ";
		$sql .= "'" . $this->dbEscape($conn, $hours) . "'";
		$sql .= ");";
		
		var_dump($sql);
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}

	public function updateHighScores($conn, $userID, $seconds, $minutes, $hours){
		// Creating the query to insert into the User table
		$sql = "UPDATE highScores SET ";
		$sql .= "seconds='" . $this->dbEscape($conn, $seconds) . "', ";
		$sql .= "minutes='" . $this->dbEscape($conn, $minutes) . "', ";
		$sql .= "hours='" . $this->dbEscape($conn, $minutes) . "' ";
		$sql .= "WHERE userID = " .  $userID . " ";
		$sql .= "LIMIT 1;";
		
		//var_dump($sql);
		
		// Querying database to save the data
		$result = mysqli_query($conn, $sql);
		
		return $result;
	}
	
	public function updateOAuthHighScores($conn, $userID, $seconds, $minutes, $hours){
		
		// Creating the query to insert into the User table
		$sql = "UPDATE OAuthHighScores SET ";
		$sql .= "seconds='" . $this->dbEscape($conn, $seconds) . "', ";
		$sql .= "minutes='" . $this->dbEscape($conn, $minutes) . "', ";
		$sql .= "hours='" . $this->dbEscape($conn, $minutes) . "' ";
		$sql .= "WHERE userID = " . $userID . " ";
		$sql .= "LIMIT 1;";
		
		//var_dump($sql);
		
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
	
	public function findIDbyUsernameOAuth($conn, $username) {
		// Creating SQL query statement
		$sql = "SELECT userID FROM OAuthUsers ";
		$sql .= "WHERE username = '" . $this->dbEscape($conn, $username) . "';";
		
		$result = mysqli_query($conn, $sql);
		$userID = mysqli_fetch_assoc($result);
		
		return $userID['userID'];
	}
	
	public function getHighScore($conn, $userID) {
		// Creating SQL query statement
		$sql = "SELECT seconds, minutes, hours FROM highScores ";
		$sql .= "WHERE userID = '" . $this->dbEscape($conn, $userID) . "';";
		
		$result = mysqli_query($conn, $sql);
		$bestRun = mysqli_fetch_assoc($result);
		
		return $bestRun;
	}
	
	public function getHighScoreOAuth($conn, $userID) {
		// Creating SQL query statement
		$sql = "SELECT seconds, minutes, hours FROM OAuthHighScores ";
		$sql .= "WHERE userID = '" . $this->dbEscape($conn, $userID) . "';";
		
		$result = mysqli_query($conn, $sql);
		$bestRun = mysqli_fetch_assoc($result);
		
		return $bestRun;
	}
	
	// Function that returns best run from the OAuthHighscore table
	public function getBestRunOauth($conn, $username) {
		// Gets the userID from the username
		$userID = $this->findIDbyUsernameOAuth($conn, $username);
		// Gets the best run by running the sql query method
		$bestRun = $this->getHighScoreOAuth($conn, $userID);

		$displaySeconds = $bestRun["seconds"];
		  
		$displayMinutes = $bestRun["minutes"];
		
		$displayHours = $bestRun["hours"];

		$result = $displayHours . ":" . $displayMinutes . ":" . $displaySeconds;

		return $result;
	}
	
	// Function that returns the number of rows in table from users table that match the username
	public function getBestRun($conn, $username) {
		// Gets the userID from the username
		$userID = $this->findIDbyUsername($conn, $username);
		// Gets the best run by running the sql query method
		$bestRun = $this->getHighScore($conn, $userID);

		$displaySeconds = $bestRun["seconds"];
		  
		$displayMinutes = $bestRun["minutes"];
		
		$displayHours = $bestRun["hours"];

		$result = $displayHours . ":" . $displayMinutes . ":" . $displaySeconds;

		return $result;
	}
}
?>