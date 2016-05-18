<?php
/* 
Send notifications, when treshold time has passed.

There are several "events", which are determined by the update times

1) Workday started. Will fire on first change in any of the customers timesheets, the current day
2) Work session started. Fires when work has started on a timesheet, and user hasn't got any "worksession_started" notification from this timesheet in the last [X1] minutes.

isn't previous 

end-time is older than [X1] minutes
   The time of work start may not be current time, because admin may have entered any date and any time.
   This event however only triggers for recent work (work that started within the last [X2] minutes)
   
3) Work session ended. Fires when work has ended on a timesheet, and no new start-time has been created for [X3] minutes
4) Timesheet updated. Fires every time the timesheet has been updated
5) Timesheet created

'currently_working_status_changed' 

'timesheet_work_started':
When 'currently_working' property changes to 1, this event will be scheduled to trigger 2 minutes from now
Delaying the notification allows us to cancel it later. Also, it gives the programmer time to optionally change the time (he may for example
set the time 10 minutes back, because he forgot to start the clock, when he began), and time to enter a task.
If 'currently_working' property changes to 0 in the meantime, the notification will be cancelled

'timesheet_work_stopped'
When 'currently_working' property changes to 0, this event will be scheduled to trigger 2 minutes from now
This gives the programmer time to optionally change the time (he may for example set the time 10 minutes back, because he forgot to stop
the clock, when he stopped)


'timesheet_closed' ('active_status_changed')
'timesheet_reopened'


 */


include_once 'inc/db.inc';
cron_called();


//send_email('bjorn@rosell.dk, dr.sofia.dahl@gmail.com', 'dette er en test', 'tjekker bare lige om email-funktionaliteten dur');
//send_email('bjorn@rosell.dk', 'cron.php was run...', 'just testing...');


// $subject = 'Bjorn arbejder nu paa [timesheet:title], [timesheet:last_task] (siden kl.[timesheet:last_starttime]) [timesheet:link]';
// echo replaceTimesheetTokens(2, $subject);

?>


