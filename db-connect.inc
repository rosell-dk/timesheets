<?php
// http://php.net/manual/en/mysqli.quickstart.connections.php
$mysqli = new mysqli("localhost", "root", "sUMA8282", "timesheets");
if ($mysqli->connect_errno) {
  echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

$admin_login = 'super';
$admin_password = 'aoeummm';
