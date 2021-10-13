<?php
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);

    define("REDIRECTURI", "http://comp-server.uhi.ac.uk/~18018535/");
    define("REDIRECTTOKENURI", "http://comp-server.uhi.ac.uk/~18018535/");

    const PROVIDERLIST = array (
        [
            "providerName" => "Discord",
            "data" => [
                "authURL" => "https://discord.com/api/oauth2/authorize",
                "tokenURL" => "https://discord.com/api/oauth2/token",
                "apiURL" => "https://discord.com/api/users/@me",
                "revokeURL" => "https://discord.com/api/oauth2/token/revoke",
                "scope" => "identify",
                "class" => "OAuth"
            ]
        ],
        [
            "providerName" => "GitHub",
            "data" => [
                "authURL" => "https://github.com/login/oauth/authorize",
                "tokenURL" => "https://github.com/login/oauth/access_token",
                "apiURL" => "https://api.github.com/user",
                "revokeURL" => "https://github.com/applications/########/grant",
                "scope" => "user",
                "class" => "OAuthGitHub"
            ]
        ],
        [
            "providerName" => "Reddit",
            "data" => [
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