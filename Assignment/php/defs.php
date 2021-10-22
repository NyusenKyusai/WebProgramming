<?php
    // Commands to make the server give the user real errors from php to troubleshoot
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);
    // Define the redirectURI and the redirectTokenUri to the login user php page
    define("REDIRECTURI", "http://comp-server.uhi.ac.uk/~18018535/php/loginUser.php");
    define("REDIRECTTOKENURI", "http://comp-server.uhi.ac.uk/~18018535/php/loginUser.php");
    // ProviderList as an array of objects
    const PROVIDERLIST = array (
        [
            // Provider Name
            "providerName" => "Discord",
            // Provider Image Path
			"providerImage" => "../assets/php/discord.png",
            // Data field that holds an object
            "data" => [
                // Holds the URL's, the scope, and the classs it uses
                "authURL" => "https://discord.com/api/oauth2/authorize",
                "tokenURL" => "https://discord.com/api/oauth2/token",
                "apiURL" => "https://discord.com/api/users/@me",
                "revokeURL" => "https://discord.com/api/oauth2/token/revoke",
                "scope" => "identify",
                "class" => "OAuth"
            ]
        ],
        [
            // Provider Name
            "providerName" => "GitHub",
            // Provider Image Path
			"providerImage" => "../assets/php/github.png",
            // Data field that holds an object
            "data" => [
                // Holds the URL's, the scope, and the classs it uses
                "authURL" => "https://github.com/login/oauth/authorize",
                "tokenURL" => "https://github.com/login/oauth/access_token",
                "apiURL" => "https://api.github.com/user",
                "revokeURL" => "https://github.com/applications/########/grant",
                "scope" => "user",
                "class" => "OAuthGitHub"
            ]
        ],
        [
            // Provider Name
            "providerName" => "Reddit",
            // Provider Image Path
			"providerImage" => "../assets/php/reddit.png",
            // Data field that holds an object
            "data" => [
                // Holds the URL's, the scope, and the classs it uses
                "authURL" => "https://www.reddit.com/api/v1/authorize",
                "tokenURL" => "https://www.reddit.com/api/v1/access_token",
                "apiURL" => "https://oauth.reddit.com/api/v1/me",
                "revokeURL" => "https://www.reddit.com/api/v1/revoke_token",
                "scope" => "identity",
                "class" => "OAuthReddit"
            ]
        ],
    );
?>