<?php
    // Commands to make the server give the user real errors from php to troubleshoot
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);
    // Calling the defs class to call the token urls
    require_once('defs.php');
    // Class that handles the curl to the OAuth server
    class CurlHandler{
        // Curl variable that holds the curl
        public $curl;
        // Constructor that sets the options of the curl method
        public function __construct($url = "") {
            // Headers that holds the type of the content
            $headers[] = "Content-Type: application/x-www-form-urlencoded";
            // Set the variable to hold the initialised url that was passed to the constructor
            $this->curl = curl_init($url);
            // Setting the options of the curl
            curl_setopt($this->curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($this->curl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $headers);
            // Setting the curl request to post
            $this->setPost();
        }

        // Method that sets the basic authentication using the cid and secret
        // as a curl option user password
        public function setBasicAuth($cid, $secret) {
            curl_setopt($this->curl, CURLOPT_USERPWD, $cid . ":" . $secret);
        }

        // Method to set the http header to the curl
        public function setHeader($header) {
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $header);
        }

        // Method to set the curl to a post request
        public function setPost($value = true) {
            curl_setopt($this->curl, CURLOPT_POST, $value);
        }

        // Method to set the query to the passed query
        public function setQuery($query = []) {
            // Sets the http query to the curl
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, http_build_query($query));
        }

        // Method to execute the curl and return the value
        public function runCURL() {
            return curl_exec($this->curl);
        }
    }

    // Original class that handles the Discord OAuth
    class OAuth {
        // Public variables that hold redirect info
        public $providerName, $authURL, $tokenURL, $apiURL, $revokeURL, $scope;
        // Protected secret and client ID
        protected $secret, $cid;
        // Variable that holds the userinfo
        public $userInfo;
        // Constructor that sets the variables to the provider info from the defs.php
        public function __construct($providerInfo, $cid, $secret) {
            $this->providerName = $providerInfo["providerName"];
			$this->providerImage = $providerInfo["providerImage"];
            $this->authURL = $providerInfo["data"]["authURL"];
            $this->tokenURL = $providerInfo["data"]["tokenURL"];
            $this->apiURL = $providerInfo["data"]["apiURL"];
            $this->revokeURL = $providerInfo["data"]["revokeURL"];
            $this->scope = $providerInfo["data"]["scope"];
            $this->cid = $cid;
            $this->secret = $secret;
        }

        // Method that creates a new CurlHandler and return a result form a curl
        public function getAuth($code) {
            // Creates a new curl using the tokenURL
            $curl = new CurlHandler($this->tokenURL);
            // Creates the headers array and sets it to json
            $headers[] = "Accept: application/json";
            // Sets the header of the curl to the headers array
            $curl->setHeader($headers);
            // Creates a paramns array and sets it to a query that holds
            // The cid the secret the tokenuri and the passed in code
            $params = array(
                "grant_type" => "authorization_code",
                "client_id" => $this->cid,
                "client_secret" => $this->secret,
                "redirect_uri" => REDIRECTTOKENURI,
                "code" => $code
            );

            // Sets the curl query to the param
            $curl->setQuery($params);
            // Sets result to the decoded json of the runCURL
            $result = json_decode($curl->runCURL());

            //var_dump($result);
            // Returns the result
            return $result;
        }

        // Method to get the authentication confirmation
        public function getAuthConfirm($token) {
            // Sets the curl to the apiURL
            $curl = new CurlHandler($this->apiURL);
            // Sets the method to get
            $curl->setPost(false);
            // Sets the header array to accept json as well as the beare token
            $headers[] = "Accept: application/json";
            $headers[] = "Authorization: Bearer " . $token;
            // Setting the header of the curl
            $curl->setHeader($headers);
            // Sets result to the decoded json of the runCURL
            $result = json_decode($curl->runCURL());

            //var_dump($result);
            // Setting the userinfo to the result of the curl
            $this->userInfo = $result;
        }

        // Method to login
        public function login() {
            // Creates an array of the client id, the redirecturi, the respnse code, and the scope
            $params = array(
                "client_id" => $this->cid,
                "redirect_uri" => REDIRECTURI,
                "response_type" => "code",
                "scope" => $this->scope
            );

            // Redirect the page to the authURL with the params http query attached to it
            header('Location: ' . $this->authURL . '?' . http_build_query($params));
            die();
        }

        // Method to generate the login text 
        public function generateLoginText() {
            // Returns a unordered list section and creates a hyperlink that is an image
            return "<li><a href='?action=login&provider=" . $this->providerName . "'><img src='" . $this->providerImage . "' width='50' height='50'></a></li>";
        }

        // Method to get the username from the userinfo
        public function getName() {
            // Returns the username
            return $this->userInfo->username;
        }

        // Returns the link to the discord avatar
        public function getAvatar() {
            return "https://cdn.discordapp.com/avatars/" . $this->getUserId() . "/" . $this->userInfo->avatar . ".png";
        }

        // Method to return the userid from the userInfo
        public function getUserId() {
            return $this->userInfo->id;
        }
    }

    // OAuthGithub class that extends OAuth to handle dealing with GitHub
    class OAuthGitHub extends OAuth {
        // Method that returns the name with the key that GitHub uses in their json
        public function getName() {
            return $this->userInfo->login;
        }

        // Method that creates the avatar link for GitHub
        public function getAvatar() {
            return "https://avatars.githubusercontent.com/u/" . $this->getUserId() . "?v=4";
        }
    }

    // OAuthReddit class that extends OAuth to handle dealing with Reddit
    class OAuthReddit extends OAuth {
        // Method that creates a new CurlHandler and return a result form a curl
        public function getAuth($code) {
            // Creates a new curl using the tokenURL
            $curl = new CurlHandler($this->tokenURL);
            // Creates the headers array and sets it to json
            $headers[] = "Accept: application/json";
            // Sets the header of the curl to the headers array
            $curl->setHeader($headers);
            // Setting the basic auth of the curl using the cid and the secret
            $curl->setBasicAuth($this->cid, $this->secret);
            // Creates an param array without the cid and the secret
            $params = array(
                "grant_type" => "authorization_code",
                "redirect_uri" => REDIRECTTOKENURI,
                "code" => $code
            );
            // Sets the curl query to the param
            $curl->setQuery($params);
            // Sets result to the decoded json of the runCURL
            $result = json_decode($curl->runCURL());

            //var_dump($result);
            // Returns the result
            return $result;
        }

        // Method to login
        public function login() {
            // A random number that is hashed using md5 to create a random string
            $randomstr = md5(rand());
            // Creates an array of the client id, the redirecturi, 
            // the response code, and the scope, and the generated string
            $params = array(
                "client_id" => $this->cid,
                "redirect_uri" => REDIRECTURI,
                "response_type" => "code",
                "scope" => $this->scope,
                "state" => $randomstr
            );
            // Redirect the page to the authURL with the params http query attached to it
            header('Location: ' . $this->authURL . '?' . http_build_query($params));
            die();
        }

        // Method to get the username from the userinfo
        public function getName() {
            // Returns the name
            return $this->userInfo->name;
        }

        // Returns the link to the discord avatar
        public function getAvatar() {
            return $this->userInfo->icon_img;
        }
    }

    // Provider class that handles different providers 
    class ProviderHandler {
        // Provider list array
        public $providerList = [];
        // Variables used in provider handler
        public $action, $activeProvider, $code, $access_token, $status;
        public $providerInstance;

        // Constructor method
        public function __construct() {
            // If statement that starts the session if it isn't created
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }
            // Setting the action to the get paramater uner the action key
            $this->action = $this->getGetParam("action");

            // If statement that handles whether the provider was gotten through the get method
            // Or the provider is in the session value
            if($this->getGetParam('provider') != null) {
                // Setting the active provider to the provider info from the GET array
                $this->activeProvider = $this->getGetParam("provider");
            } else {
                // Setting the active provider to the provider info from the session
                $this->activeProvider = $this->getSessionValue("provider");
            }
            // Getting the code form the GET array and setting it to the code
            $this->code = $this->getGetParam("code");
            // Getting the access token from the session and setting it to the access token
            $this->access_token = $this->getSessionValue("access_token");
        }

        // Method that handles loggin in
        public function login() {
            // Sets the session provider to the provider name and OAuth to true
            $this->setSessionValue('provider', $this->providerInstance->providerName);
			$this->setSessionValue('OAuth', 'true');
            // Sets status to loggin in
            $this->status = "logging in";
            // Calls the login function from the OAuth class
            $this->providerInstance->login();
        }

        // Method that handles logout
        public function logout() {
            // Setting the status to logged out
            $this->status = "logged out";
            // Unsetting the session
            session_unset();
            // Redirecting to the same page
            header("Location: " . $_SERVER['PHP_SELF']);

            //echo "logout stub";
        }

        // Generating the logout html and returning it
        public function generateLogout() {
            return "<p><a href='?action=logout'>Log Out / Clear</a></p>";
        }

        // Method that calls different methods depending on the action variable
        public function performAction() {
            // For each loop that handles all the providers
            foreach($this->providerList as $provider) {
                // If statement that runs code if the active provider is the same
                // as the item in for each loop
                if ($provider->providerName == $this->activeProvider) {
                    // Setting the provider instace to the provider
                    $this->providerInstance = $provider;
                    // If statement that runs the correct method according to the action
                    if ($this->action == "login") {
                        // Runs login if the action is the login
                        $this->login();
                    } else if ($this->action == "logout") {
                        // Runs logout if the action is logout
                        $this->logout();
                    } else if ($this->getSessionValue('access_token')) {
                        // Runs the process token method if the access_token is set
                        $this->processToken();
                    } else if ($this->code) {
                        // Runs the processCode method if the code is true
                        $this->processCode();
                    }
                }
            }
        }

        // Method that gets that auth from the OAuth class
        // If the access_token is set it sets session values, the status, 
        // and runs the processToken method
        public function processCode() {
            // Runs the OAuth class getAuth and sets it to the result variable
            $result = $this->providerInstance->getAuth($this->code);
    
            if ($result->access_token) {
                // Sets that status to logged in
                $this->status = "logged in";
                // Sets the access_token session variable to the access token
                $this->setSessionValue("access_token", $result->access_token);
                // Rund the processToken method
                $this->processToken();
            }
        }

        // Method to process the token
        public function processToken() {
            // Sets the status to logged in
            $this->status = "logged in";
            // Runs the OAuth getAuthConfirm method and passes the access_token to it from the session
            $this->providerInstance->getAuthConfirm($this->getSessionValue("access_token"));
        }

        // Method that adds a provider using the name, the cid, and the secret
        public function addProvider($name, $cid, $secret) {
            // Sets the provider info to the provider data from the passed provider name
            $providerInfo = $this->getProviderData($name);
            // If the providerInfo is not null
            if ($providerInfo !== null) {
                // Pushes the provider info to the providerList array
                array_push($this->providerList, new $providerInfo["data"]["class"]($providerInfo, $cid, $secret));
            }
        }

        // Method that returns the data from the providerlist object
        public function getProviderData($name) {
            // Loops through the object
            foreach(PROVIDERLIST as $provider) {
                // If the provider name of the item is the same as the passed $name
                if ($provider["providerName"] == $name) {
                    // returns the provider
                    return $provider;
                }
            }
            // Returns null as none of the object providers match the passed name
            return null;
        }

        // Method that generates the login text
        public function generateLoginText() {
            // Initualises the variable
            $result = "";
            // Concats the generate login text from the OAuth for each provider
            foreach($this->providerList as $provider) {
                // Concats the generate login text from the OAuth class
                $result.=$provider->generateLoginText();
            }
            // Returns the result
            return $result;
        }

        // Method that return the value in the array if the key exists in the GET Array
        public function getGetParam($key, $default = null) {
            // If not, it returns null
            return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
        }

        // Method that returns the session value in the key if it exists
        public function getSessionValue($key, $default = null) {
            // Otherwise it returns null
            return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
        }

        // Method that sets the session value using a key
        public function setSessionValue($key, $value) {
            $_SESSION[$key] = $value;
        }
    }
?>