
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
        $text = str_replace($token, $settings['url'] . 'index.php?timesheet=' . $timesheet_id, $text);        
    }
  }
  return $text;
}
function notify($customer_id, $event_type) {
//  echo 'notify:' . $customer_id . ':' . $event_type;

  $res = sqlQuery("SELECT * FROM email_notifications WHERE customer_id=" . $customer_id);
  if ($res->num_rows == 0) {
    return;
  }
  $row = $rows->fetch_assoc();

  if (empty($row['emails'])) {
    return;
  }
  $eventIds = json_decode($row['events']);


/*
  $res = sqlQuery("SELECT * FROM notifications WHERE customer_id=" . $customer_id . " AND event_type=" . sqlVal($event_type));
  if ($res->num_rows == 0) {
    return;
  }*/
  if ($event_type == 'timesheet_work_started') {
    $subject = 'Bjørn arbejder nu på [timesheet:title][timesheet:last_task] (siden [timesheet:last_starttime])';
    $body = '[timesheet_task_breakdown]';
  }
  $row = $rows->fetch_assoc();
  if (!empty($row['emails'])) {
    notify_email($customer_id, $event_type, $row['emails'], $row['email_template_subject'], $row['email_template_text']);
  }
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
  include_once 'lib/Maker.php';
  global $settings;
  $m = new rosell\Maker();
  $m->trigger($settings['admin_maker_key'], 'send_mail', $emails, $subject, $body);
}

