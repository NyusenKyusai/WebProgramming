<!DOCTYPE html>
<head>
<title>OAuth Demo</title>
<?php
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(-1);

    require_once("OAuth.class.php");

    $handler = new ProviderHandler();
    $handler->addProvider("Discord", "896813766199623691", "aQkRp6pNX38cPGJrO3cKJFqe5qK0G06o");

    $handler->performAction();
    //var_dump($handler);
?>
</head>

<body>
    <?php
        if ($handler->status == "logged out" || $handler->status == null) {
            echo $handler->generateLoginText();
        }

        if ($handler->status != "logged out") {
            echo $handler->generateLogout();
        }
        
        if ($handler->status == "logged in") {
            echo "<h1>" . $handler->providerInstance->getName() . "</h1>";
            echo "<img src ='" . $handler->providerInstance->getAvatar() . "' />";

            $scripthtml =  "<script>'use strict'; let username ='" . $handler->providerInstance->getName() . "';";
            $scripthtml .= "let avatar = '" . $handler->providerInstance->getAvatar() . "';";
            $scripthtml .= "</script>";

            echo $scripthtml;
        }
        
        

        
    ?>
    <script>
        <?php if ($handler->status == "logged in") { ?>
            console.log("avatar " + avatar + " username " + username);
        <?php } ?>
    </script>
</body>