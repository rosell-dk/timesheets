
<?php
// http://php.net/manual/en/mysqli.quickstart.connections.php

include_once 'settings.inc';

$dbset = $settings['database_connection'];
$mysqli = new mysqli($dbset['host'], $dbset['user'], $dbset['password'], $dbset['database']);

if ($mysqli->connect_errno) {
  echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


// Some tools

function sqlVal($value) {
  switch (gettype($value)) {
    case 'integer':
    case 'double':
      return $value;
    case 'boolean':
      return ($value ? 1 : 0);
    case 'string':
      return "'" . $value . "'";
    default:
      return $value;
  }
}

// Run query
// If there is an erroy, it will return null, and the error can is accesible in $mysqli->error;
function sqlQuery($sql) {
  global $mysqli;
  return $mysqli->query($sql);
}

/* Return: success (boolean) */
function sqlInsert($table, $insert) {
  $values = array();
  foreach ($insert as $key => $value) {
    $values[] = sqlVal($value);
  }
  return sqlQuery('INSERT INTO ' . $table . '(' . implode(',', array_keys($insert)) . ') VALUES (' . implode(',', $values) . ')');
}

/* Return: success (boolean) */
function sqlUpdate($table, $update, $whereString) {
  $assignments = array();
  foreach ($update as $key => $value) {
    $assignments[] = $key . '=' . sqlVal($value);
  }
  return sqlQuery('UPDATE ' . $table . ' SET ' . implode(',', $assignments) . ' WHERE ' . $whereString);
}

function sqlDelete($table, $whereString) {
  return sqlQuery('DELETE FROM ' . $table . ' WHERE ' . $whereString);
}

/* Notification setup for customers
CREATE TABLE notifications (
    customer_id INT(10) NOT NULL,
    event_type CHAR(40),
    emails CHAR(255),
    email_template_subject CHAR(255),
    email_template_body TEXT,
    maker_key CHAR(50),
    treshold INT(10) NOT NULL,    
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);*/

function cron_called() {
  send_waiting_timesheet_notifications();
}

function send_waiting_timesheet_notifications() {

  // Delete outdated notifications that for some reason are in the queue (eg. due to cron failure)
  // 12 hours is too old for our taste
  sqlQuery("DELETE FROM timesheet_event_scheduler WHERE DATE_ADD(time, INTERVAL 12 HOUR) < NOW()");

  // Fetch notifications that are ready
  $res = sqlQuery("SELECT t.id as timesheet_id, ev.event_type as event_type, t.customer_id as customer_id FROM timesheet_event_scheduler as ev JOIN timesheets as t on ev.timesheet_id = t.id WHERE ev.time < NOW()");

  while ($row = $res->fetch_assoc()) {
    $timesheet_id = $row['timesheet_id'];
    $customer_id = $row['customer_id'];
    $event_type = $row['event_type'];


  //    notify($notification_type);
    notify($customer_id, $event_type, $timesheet_id);
    sqlQuery("DELETE FROM timesheet_event_scheduler WHERE timesheet_id = " . $timesheet_id . " AND event_type = " . sqlVal($event_type));
  }
}

function replaceTimesheetTokens($timesheet_id, $text) {
  $res = sqlQuery("SELECT title, last_task, last_starttime, last_endtime FROM timesheets WHERE id=" . $timesheet_id);
  if ($res->num_rows == 0) {
    return;
  }
  $row = $res->fetch_assoc();

  $available_tokens = array('[timesheet:title]', '[timesheet:last_task]', '[timesheet:last_starttime]', '[timesheet:last_endtime]', '[timesheet:link]');
  foreach ($available_tokens as $i => $token) {
    switch ($token) {
      case '[timesheet:last_task]':
        $text = str_replace($token, (empty($row['last_task']) ? 'uspecificeret' : $row['last_task']), $text);
        break;
      case '[timesheet:title]':
      case '[timesheet:last_starttime]':
      case '[timesheet:last_endtime]':
        preg_match('/:(.*)\\]/', $token, $matches);
        $row_name = $matches[1];
        $text = str_replace($token, $row[$row_name], $text);
        break;
      case '[timesheet:link]':
        global $settings;
        $text = str_replace($token, $settings['url'] . 'timesheets.php?timesheet=' . $timesheet_id, $text);        
    }
  }
  return $text;
}
function notify($customer_id, $event_type, $timesheet_id) {
  echo 'notify:' . $customer_id . ':' . $event_type . '<br>';

  $res = sqlQuery("SELECT * FROM email_notifications WHERE customer_id=" . $customer_id);
  if ($res->num_rows == 0) {
    return;
  }
  $row = $res->fetch_assoc();

  $eventNames = json_decode($row['events']);
  // Check if customer has subscribed to this event
  if (!in_array($event_type, $eventNames)) {
    return;
  }

  // Check if there is any emails entered
  if (empty($row['emails'])) {
    return;
  }
  $emails = $row['emails'];

  if ($event_type == 'timesheet_work_started') {
    $subject = replaceTimesheetTokens($timesheet_id, 'Bjørn arbejder nu på [timesheet:title], [timesheet:last_task] (siden [timesheet:last_starttime])');
    $body = replaceTimesheetTokens($timesheet_id, 'Link til timeseddel: [timesheet:link]'); // [timesheet_task_breakdown]
    send_email($emails, $subject, $body);
    return;
  }
  if ($event_type == 'timesheet_work_stopped') {
    $subject = replaceTimesheetTokens($timesheet_id, 'Bjørn har stoppet arbejdet på [timesheet:title] (kl. [timesheet:last_endtime])');
    $body = replaceTimesheetTokens($timesheet_id, 'Link til timeseddel: [timesheet:link]'); // [timesheet_task_breakdown]
    send_email($emails, $subject, $body);
    return;
  }
  if ($event_type == 'timesheet_task_switched') {
    $subject = replaceTimesheetTokens($timesheet_id, 'Bjørn har skiftet task på [timesheet:title]: [timesheet:last_task])');
    $body = replaceTimesheetTokens($timesheet_id, 'Link til timeseddel: [timesheet:link]'); // [timesheet_task_breakdown]
    send_email($emails, $subject, $body);
    return;
  }


  if (empty($subject)) {
    return;
  }

/*  if (!empty($row['emails'])) {
    notify_email($customer_id, $event_type, $row['emails'], $row['email_template_subject'], $row['email_template_text']);
  }*/
}

function notify_email($customer_id, $event_type, $emails, $email_template_subject, $email_template_body) {
  if (empty($email_template_subject)) {
    $email_template_subject = 'Timeseddel event';
  }


  $subject = $email_template_subject;
  $body = $email_template_body;

  send_email($emails, $subject, $body);
}

function send_email($emails, $subject, $body) {
  echo 'send_email:' . $emails . '<br>subject: ' . $subject . '<br>body: ' . $body;
//return
  include_once 'lib/Maker.php';
  global $settings;
  $m = new rosell\Maker();
  $m->trigger($settings['admin_maker_key'], 'send_mail', $emails, $subject, $body);
}

