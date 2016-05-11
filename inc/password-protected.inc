<?php


include_once 'db.inc';

session_start();

// Test if user is already logged in
function isLoggedIn() {
  return (isset($_SESSION['valid']) && ($_SESSION['valid'] == TRUE));
}

// Test if we are receiving a valid-looking login form submit
function isLoginAttempt() {
  return (isset($_POST['login']) && !empty($_POST['username']) && !empty($_POST['password']));
}

function login($username, $password = '') {

  global $settings;
  $admin_login = $settings['admin_credentials']['login'];
  $admin_password = $settings['admin_credentials']['password'];

  global $mysqli;

  $success;

  if (($username == $admin_login) && ($password == $admin_password)) {
    $success = TRUE;
    $_SESSION['admin'] = true;
  }
  else {
    $sql = "SELECT id from customers WHERE login = '" . str_replace("'", "''", $username) . "'";
    if ($password != '') {
      $sql .= " AND password = '" . str_replace("'", "''", $password) . "'";
    }
    $res = $mysqli->query($sql);
    if ($res->num_rows == 0) {
      $success = FALSE;
    }
    else {
      $success = TRUE;
      $_SESSION['admin'] = FALSE;

      $row = $res->fetch_assoc();
      $_SESSION['customer_id'] = $row['id'];
    }
  }

  $_SESSION['valid'] = $success;

  if ($success) {
    setcookie('login', $username, time() + (86400 * 30), "/");       // Save login for one month, or till next logout
    setcookie('password', $password, time() + (86400 * 30), "/");    // Save login for one month, or till next logout
    setcookie('lastlogin', $username, time() + (86400 * 360), "/");  // lastlogin will not be cleared on logout. It will be used to prepopulate form
  }

  return $success;
}


if (!isLoggedIn()) {  
//  header('Refresh: 1; URL = login.php');

  if (isLoginAttempt()) {
    $res = login($_POST['username'], $_POST['password']);
    if (!$res) {
      include('login-form.inc');
      exit();  
    }
  }
  else {

    // If login/password is in a cookie, try to log in with that
    if ((isset($_COOKIE['login'])) && ($_COOKIE['login'] != '')) {
      $res = login($_COOKIE['login'], $_COOKIE['password']);
      if (!$res) {
        include('login-form.inc');
        exit();  
      }
    }
    else {
      include('login-form.inc');
      exit();  
    }
  }
}

function isAdmin() {
  return (isset($_SESSION['admin']) && ($_SESSION['admin'] == TRUE));
}


