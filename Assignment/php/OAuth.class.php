<?php
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);
    require_once('defs.php');

    class CurlHandler{
        public $curl;

        public function __construct($url = "") {
            $headers[] = "Content-Type: application/x-www-form-urlencoded";

            $this->curl = curl_init($url);
            curl_setopt($this->curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($this->curl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $headers);

            $this->setPost();
        }

        public function setBasicAuth($cid, $secret) {
            curl_setopt($this->curl, CURLOPT_USERPWD, $cid . ":" . $secret);
        }

        public function setHeader($header) {
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $header);
        }

        public function setPost($value = true) {
            curl_setopt($this->curl, CURLOPT_POST, $value);
        }

        public function setQuery($query = []) {
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, http_build_query($query));
        }

        public function runCURL() {
            return curl_exec($this->curl);
        }
    }

    class OAuth {
        public $providerName, $authURL, $tokenURL, $apiURL, $revokeURL, $scope;

        protected $secret, $cid;

        public $userInfo;

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

        public function getAuth($code) {
            $curl = new CurlHandler($this->tokenURL);

            $headers[] = "Accept: application/json";
            $curl->setHeader($headers);

            $params = array(
                "grant_type" => "authorization_code",
                "client_id" => $this->cid,
                "client_secret" => $this->secret,
                "redirect_uri" => REDIRECTTOKENURI,
                "code" => $code
            );

            $curl->setQuery($params);
            $result = json_decode($curl->runCURL());

            //var_dump($result);

            return $result;
        }

        public function getAuthConfirm($token) {
            $curl = new CurlHandler($this->apiURL);
            $curl->setPost(false);
            $headers[] = "Accept: application/json";
            $headers[] = "Authorization: Bearer " . $token;
            $curl->setHeader($headers);
            $result = json_decode($curl->runCURL());

            //var_dump($result);

            $this->userInfo = $result;
        }

        public function login() {
            $params = array(
                "client_id" => $this->cid,
                "redirect_uri" => REDIRECTURI,
                "response_type" => "code",
                "scope" => $this->scope
            );

            header('Location: ' . $this->authURL . '?' . http_build_query($params));
            die();
        }

        public function generateLoginText() {
            return "<li><a href='?action=login&provider=" . $this->providerName . "'><img src='" . $this->providerImage . "' width='50' height='50'></a></li>";
        }

        public function getName() {
            return $this->userInfo->username;
        }

        public function getAvatar() {
            return "https://cdn.discordapp.com/avatars/" . $this->getUserId() . "/" . $this->userInfo->avatar . ".png";
        }

        public function getUserId() {
            return $this->userInfo->id;
        }
    }

    class OAuthGitHub extends OAuth {
        public function getName() {
            return $this->userInfo->login;
        }

        public function getAvatar() {
            return "https://avatars.githubusercontent.com/u/" . $this->getUserId() . "?v=4";
        }
    }

    class OAuthReddit extends OAuth {
        public function getAuth($code) {
            $curl = new CurlHandler($this->tokenURL);

            $headers[] = "Accept: application/json";
            $curl->setHeader($headers);

            $curl->setBasicAuth($this->cid, $this->secret);

            $params = array(
                "grant_type" => "authorization_code",
                "redirect_uri" => REDIRECTTOKENURI,
                "code" => $code
            );

            $curl->setQuery($params);
            $result = json_decode($curl->runCURL());

            //var_dump($result);

            return $result;
        }

        public function login() {
            $randomstr = md5(rand());

            $params = array(
                "client_id" => $this->cid,
                "redirect_uri" => REDIRECTURI,
                "response_type" => "code",
                "scope" => $this->scope,
                "state" => $randomstr
            );

            header('Location: ' . $this->authURL . '?' . http_build_query($params));
            die();
        }

        public function getName() {
            return $this->userInfo->name;
        }

        public function getAvatar() {
            return $this->userInfo->icon_img;
        }
    }

    class ProviderHandler {
        public $providerList = [];

        public $action, $activeProvider, $code, $access_token, $status;
        public $providerInstance;

        public function __construct() {
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            $this->action = $this->getGetParam("action");

            if($this->getGetParam('provider') != null) {
                $this->activeProvider = $this->getGetParam("provider");
            } else {
                $this->activeProvider = $this->getSessionValue("provider");
            }

            $this->code = $this->getGetParam("code");

            $this->access_token = $this->getSessionValue("access_token");
        }

        public function login() {
            $this->setSessionValue('provider', $this->providerInstance->providerName);
			$this->setSessionValue('OAuth', 'true');

            $this->status = "logging in";

            $this->providerInstance->login();
        }

        public function logout() {
            $this->status = "logged out";

            session_unset();
            header("Location: " . $_SERVER['PHP_SELF']);

            //echo "logout stub";
        }

        public function generateLogout() {
            return "<p><a href='?action=logout'>Log Out / Clear</a></p>";
        }

        public function performAction() {
            foreach($this->providerList as $provider) {
                if ($provider->providerName == $this->activeProvider) {

                    $this->providerInstance = $provider;

                    if ($this->action == "login") {
                        $this->login();
                    } else if ($this->action == "logout") {
                        $this->logout();
                    } else if ($this->getSessionValue('access_token')) {
                        $this->processToken();
                    } else if ($this->code) {
                        $this->processCode();
                    }
                }
            }
        }

        public function processCode() {
            $result = $this->providerInstance->getAuth($this->code);

            if ($result->access_token) {
                $this->status = "logged in";
                $this->setSessionValue("access_token", $result->access_token);
                $this->processToken();
            }
        }

        public function processToken() {
            $this->status = "logged in";
            $this->providerInstance->getAuthConfirm($this->getSessionValue("access_token"));
        }

        public function addProvider($name, $cid, $secret) {
            $providerInfo = $this->getProviderData($name);

            if ($providerInfo !== null) {
                array_push($this->providerList, new $providerInfo["data"]["class"]($providerInfo, $cid, $secret));
            }
        }

        public function getProviderData($name) {
            foreach(PROVIDERLIST as $provider) {
                if ($provider["providerName"] == $name) {
                    return $provider;
                }
            }

            return null;
        }

        public function generateLoginText() {
            $result = "";

            foreach($this->providerList as $provider) {
                $result.=$provider->generateLoginText();
            }

            return $result;
        }

        public function getGetParam($key, $default = null) {
            return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
        }

        public function getSessionValue($key, $default = null) {
            return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
        }

        public function setSessionValue($key, $value) {
            $_SESSION[$key] = $value;
        }
    }
?>