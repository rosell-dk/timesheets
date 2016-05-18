<?php
// include_once('../inc/password-protected.inc');

/*
function adminer_object() {
    // required to run any plugin
    include_once "./plugins/plugin.php";
    
    // autoloader
    foreach (glob("plugins/*.php") as $filename) {
        include_once "./$filename";
    }
    
    global $settings;

    $plugins = array(
        // specify enabled plugins here
        new AdminerAutoLogin($settings['database_connection']['database']),
    );
    
    /* It is possible to combine customization and plugins:
    class AdminerCustomization extends AdminerPlugin {
    }
    return new AdminerCustomization($plugins);
    */
/*    
    return new AdminerPlugin($plugins);
}
*/
// include original Adminer or Adminer Editor


// https://www.adminer.org/en/extension/

include "../settings.inc";

session_start();

// Test if user is already logged in
function isLoggedIn() {
  return (isset($_SESSION['valid']) && ($_SESSION['valid'] == TRUE));
}

function isAdmin() {
  return (isset($_SESSION['admin']) && ($_SESSION['admin'] == TRUE));
}

if (!isAdmin()) {
  echo 'log in as admin to use this tool';
  exit;
}

function adminer_object() {

  class AdminerSoftware extends Adminer {
		
		function __construct() {
		}
		
    public function credentials() {
      global $settings;
      $dbc = $settings['database_connection'];

      return array(
        $dbc['host'], $dbc['user'], $dbc['password']
      );
	  }
/*		
	  public function database() {
      return 'timesheets';
  //		return $this->db_config->default['database'];
	  }*/
		
	}
	
	return new AdminerSoftware;
}


include "./adminer-4.2.4-mysql-en.php";


?>
