<?php
header("Expires: 0");
header("Cache-Control: no-cache, must-revalidate, post-check=0, pre-check=0");
header("Pragma: no-cache");


header('Content-type: application/json');
//header('Content-Type: text/xml'); 
//header('Content-Type: text/html');

session_start();

/* User must be logged in */
if (!isset($_SESSION['valid'])) {
  $response = array(
    'success' => FALSE,
    'errormsg' => 'not logged in'
  );
  echo json_encode($response);
  exit;
}

include_once 'inc/db.inc';


global $settings;
global $mysqli;

$action = $_POST['action'];


/* Test if user has permission to requested action */
/* (non-admin users only has permission to two actions: get_timesheet and get_timesheet_list) */
if ((!$_SESSION['admin']) && (($action != 'get_timesheet') && ($action != 'get_timesheet_list') && ($action != 'get_available_events') && ($action != 'set_notifications') && ($action != 'get_notifications'))) {
  echo json_encode(array(
    'success' => FALSE,
    'errormsg' => 'permission denied'
  ));
  exit;
}

function notifyMakerTimesheetUpdated($timesheetId) {
  // Get customer id
  global $mysqli;
  $res = $mysqli->query("SELECT customer_id, maker_key FROM timesheets as t INNER JOIN customers AS c ON t.customer_id = c.id WHERE t.id=" . $timesheetId);
  $row = $res->fetch_assoc();
  $makerKey = $row['maker_key'];

  if ($makerKey == null) {
    return;
  }

  include_once 'lib/Maker.php';
  $m = new rosell\Maker();
//  $m->trigger($makerKey, 'timesheet_updated');

}

function scheduleTimesheetEvent($timesheet_id, $event_type, $seconds) {

  sqlDelete('timesheet_event_scheduler', 'timesheet_id=' . $timesheet_id . " AND event_type='" . $event_type . "'");
/*
  $insert = array(
    'timesheet_id' => $timesheet_id,
    'event_type' => $event_type,
    'time' => (($_POST['currently_working'] == '1') ? 1 : 0)
  );
  sqlInsert('timesheet_event_scheduler', $insert);*/

  $success = sqlQuery('INSERT INTO timesheet_event_scheduler (timesheet_id, event_type, time) VALUES (' . $timesheet_id . ',' . sqlVal($event_type) . ',DATE_ADD(NOW(),INTERVAL ' . $seconds . ' SECOND))');

  return $success;
}

/*   GET TIMESHEET
---------------------- */
if ($action == 'get_timesheet') {
  $id = $_POST['id'];
  $res = $mysqli->query("SELECT data, description, currently_working from timesheets WHERE id=" . $id);
  $row = $res->fetch_assoc();
  $response = array(
    'success' => TRUE,
    'data' => array(
      'data' => json_decode($row['data']),
      'description' => $row['description'],
      'currently_working' => $row['currently_working']
    )
  );
  echo json_encode($response);
}

/*   GET AVAILABLE EVENTS
-------------------------- */
if ($action == 'get_available_events') {
  $res = sqlQuery("SELECT id, event_name from events");
  $events = array();
  while ($row = $res->fetch_assoc()) {
    $events[] = array(
      'id' => $row['id'],
      'event_name' => $row['event_name']
    );
  }
  $response = array(
    'success' => TRUE,
    'data' => $events
  );
  echo json_encode($response);
}

/*   SET NOTIFICATIONS
-------------------------- */
if ($action == 'set_notifications') {
  $customer_id = ($_SESSION['admin'] ? $_POST['customer_id'] : $_SESSION['customer_id']);
  $insert = array(
    'customer_id' => $customer_id,
    'emails' => $_POST['emails'],
    'events' => $_POST['events'],
  );

  sqlDelete('email_notifications', 'customer_id=' . sqlVal($customer_id));
  $success = sqlInsert('email_notifications', $insert);
  echo '{"success":' . ($success ? 'true' : 'false') . ($success ? '' : ', "errormsg": "' . $mysqli->error . '"') . '}';
}

/*   GET NOTIFICATIONS
-------------------------- */
if ($action == 'get_notifications') {
  $customer_id = ($_SESSION['admin'] ? $_POST['customer_id'] : $_SESSION['customer_id']);

  $res = sqlQuery("SELECT * FROM email_notifications WHERE customer_id = " . $customer_id);

  $row = $res->fetch_assoc();
  $response = array(
    'success' => TRUE,
    'data' => array(
      'events' => json_decode($row['events']),
      'emails' => $row['emails'],
    )
  );
  echo json_encode($response);
}

/*   SET TIMESHEET
----------------------
Sets the timesheet (rows and columns). Does not set any other data related to the timesheet
For that, use 'update_timesheet_meta'
*/
if ($action == 'set_timesheet') {
  $id = $_POST['id'];

  $beforeChangeRow = $mysqli->query("SELECT currently_working, total from timesheets WHERE id = '" . $id . "'")->fetch_assoc();

  $update = array(
    'data' => $_POST['data'],
    'total' => floatval($_POST['total']),
    'currently_working' => (($_POST['currently_working'] == '1') ? 1 : 0),
    'last_task' => $_POST['last_task'],
    'last_starttime' => $_POST['last_starttime'],
    'last_endtime' => $_POST['last_endtime'],
  );
//  $success = $mysqli->query("UPDATE timesheets SET data = '" . $data . "' WHERE id = '" . $id . "'");
  $success = sqlUpdate('timesheets', $update, 'id = ' . $id);
  if ($success) {
//    $success = $mysqli->query("INSERT INTO timesheet_revisions(timesheet_id,data) VALUES (" . $id . ",'" . $data . "')");

    if ($beforeChangeRow['currently_working'] != $update['currently_working']) {
      // 'currently_working' changed

      if ($update['currently_working'] == 1) {
        if (!scheduleTimesheetEvent($id, 'timesheet_work_started', 60)) {
          echo '{"success":false, "errormsg": "' . $mysqli->error . '"}';
        }
      }
      else {
        if (!scheduleTimesheetEvent($id, 'timesheet_work_stopped', 60)) {
          echo '{"success":false, "errormsg": "' . $mysqli->error . '"}';
        }
      }
    
    }

    notifyMakerTimesheetUpdated($id);

  }
  echo '{"success":' . ($success ? 'true' : 'false') . ($success ? '' : ', "errormsg": "' . $mysqli->error . '"') . '}';
}

/*   GET TIMESHEET LIST
-------------------------- */
if ($action == 'get_timesheet_list') {
  $sql = "SELECT id,title from timesheets";
  if (!$_SESSION['admin']) {
    $sql .= " WHERE customer_id = " . $_SESSION['customer_id'];
  }
  $res = $mysqli->query($sql);
  $timesheets = array();
  while ($row = $res->fetch_assoc()) {
    $timesheets[] = array(
      'id' => $row['id'],
      'title' => $row['title']
    );
  }
  $response = array(
    'success' => TRUE,
    'data' => $timesheets
  );
  echo json_encode($response);
}


/*   CREATE SHEET
--------------------- */
if ($action == 'create_sheet') {
  $success = sqlInsert('timesheets', array(
    'title' => $_POST['title'],
    'customer_id' => $_POST['customer_id'],
    'active' => ($_POST['active'] == '1'),
    'billed' => ($_POST['billed'] == '1'),
    'fixed_price' => ($_POST['fixed_price'] == '1'),
    'description' => $_POST['description'],
  ));
  echo '{"success":' . ($success ? 'true' : 'false') . ($success ? '' : ', "errormsg": "' . $mysqli->error . '"') . '}';
}

/*   UPDATE TIMESHEET META
-------------------------- */
if ($action == 'update_timesheet_meta') {
  switch ($_POST['key']) {
    case 'description':
      $update = array($_POST['key'] => $_POST['value']);
      break;
  }
  if (isset($update)) {
    $success = sqlUpdate('timesheets', $update, 'id=' . $_POST['id']);
    echo '{"success":' . ($success ? 'true' : 'false') . ($success ? '' : ', "errormsg": "' . $mysqli->error . '"') . '}';
  }
  else {
    echo '{"success":false}';
  }
}

/*   CREATE CUSTOMER
----------------------- */
if ($action == 'create_customer') {
  $companyname = $_POST['companyname'];
  $login = $_POST['login'];
  $password = $_POST['password'];
  $success = $mysqli->query("INSERT INTO customers(companyname, login, password) VALUES ('" . $companyname . "','" . $login . "','" . $password . "')");

  echo '{"success":' . ($success ? 'true' : 'false') . '}';
}


/*   GET CUSTOMER LIST
-------------------------- */
if ($action == 'get_customer_list') {
  $sql = "SELECT id,companyname FROM customers";
  $res = $mysqli->query($sql);
  $customers = array();
  while ($row = $res->fetch_assoc()) {
    $customers[] = array(
      'id' => $row['id'],
      'companyname' => $row['companyname']
    );
  }
  $response = array(
    'success' => TRUE,
    'data' => $customers
  );
  echo json_encode($response);
}


?>


