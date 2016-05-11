<?php
?>
<html lang="da-DK">
  <head>
    <meta charset="UTF-8" />
    <title>Rosell IT - Timesedler</title>
    <style>
      body {
        text-align: center;
        padding-top: 15%;
      }
      body > div {
        text-align: left;
        display: inline-block;
      }
      input {margin: 3px}
      .notice {font-size: 0.9em; margin-top: 25px;}
    </style>
<?php 
if (isLoginAttempt()) {
?>
    <script src="http://code.jquery.com/jquery-1.10.2.js"></script>
    <script src="http://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script>
      $(function() {
        $('body > div').effect( "shake" );
        
      })();
    </script>
<?php } ?>
  </head>

  <body>      
    <div>
      <h2>Login er påkrævet</h2> 
      <?php 
      if (isLoginAttempt()) {
        echo '<b>Beklager, dur ikke. Prøv igen!</b><br><br>';
      } 
      ?>
      <div class="container">      
         <form class="form-signin" role="form" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="post">
            <input type="text" class="form-control" name="username" placeholder="brugernavn" required autofocus <?php 
              if (isset($_COOKIE['lastlogin'])) {
                echo ' value="' . $_COOKIE['lastlogin'] . '"';
              } ?>><br>
            <input type="password" class="form-control" name="password" placeholder="adgangskode" required>
            <button type="submit" name="login">Log ind</button>
         </form>
	
      </div> 
      <p class="notice"><i>Bemærk:</i> Du vil automatisk være logget på i en måned, <br>med mindre du logger ud.</p>
    </div>
  </body>
</html>
