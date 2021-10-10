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
                "authURL" => "",
                "tokenURL" => "",
                "apiURL" => "",
                "revokeURL" => "",
                "scope" => "",
                "class" => "OAuth"
            ]
        ],
        [
            "providerName" => "Reddit",
            "data" => [
                "authURL" => "",
                "tokenURL" => "",
                "apiURL" => "",
                "revokeURL" => "",
                "scope" => "",
                "class" => "OAuth"
            ]
        ],
    );
?>