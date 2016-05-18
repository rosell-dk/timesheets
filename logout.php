<?php
  session_start();
  unset($_SESSION["valid"]);
  unset($_SESSION["customer_id"]);
  unset($_SESSION["admin"]);   

  setcookie("login", "", time() - 13600, "/");
  unset($_COOKIE['login']);

  setcookie("password", "", time() - 13600, "/");
  unset($_COOKIE['password']);


?>
<html lang="da-DK">
  <head>
    <meta charset="UTF-8" />
<!--    <meta http-equiv="refresh" content="1;URL=timesheets.php">-->
    <meta charset="utf-8">
    <title>Bye bye!</title>
    <style>
      body {
        text-align: center;
        padding-top: 15%;
      }
      body > div {
        text-align: left;
        display: inline-block;
      }
    </style>    
  </head>
  <body onload="window.location='/'">      
    <div>
      <h2>Hej hej!</h2><?php echo $_COOKIE['login'] ?>
    </div>
  </body>
</html>
