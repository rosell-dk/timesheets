# timesheets
Create excell-like timesheets and let your customers view them

## Screenshot
![Screenshot](/screenshot.png?raw=true "Screenshot")

## Features
- Datepicker allows quick selection of date. (uses "moment.js" to parse dates)
- Timepicker allows quick selection of time (tab between hours and seconds, and use arrow up/down key to increase/decrease)
- Autocomplete allows quick selection of tasks you already worked on
- There are also handy "start working" and "stop working" buttons.
- Overview with work hours per task, which updates instantly.
- Sheet is saved almost instantly (1 second after last change)
- Customers can be allowed to log in and view their timesheets (not edit)
- Customers can opt in for notifications when work starts, etc.


## Installation
- Create a mysql database (ie: CREATE DATABASE timesheets CHARACTER SET utf8)
- Fill it with data from the file SQL.txt (ie mysql -u username -p timesheets < SQL.txt)
- Copy 'default.setting.inc' to 'settings.inc'
- Enter database settings and admin password
- Log in as admin. You can now create timesheets and customers.
- Currently, the system can only send notifications through ifttt.com. You will need an ifttt.com account, and you will need to subscribe to the called "Maker". Doing that provides you with a key, which you must insert in settings.inc. And finally, you will need to set create a recipee "send_email": IF Maker event "send_email" THEN Send an email to: [Value1], subject: [Value2], body: [Value3]
- For notifications to be sent, you will need to make sure cron.php is called, for example every minute. 

## A word about notification of work start
When you click "start working", or enter a starttime, an "work_started" notification will be <i>scheduled</i> to be sent in a minute. This gives you enough time to make changes before the notification is send (you may for example wish to set the time back a bit, if you didn't start the clock at the exact time you started working). When a minute has passed, the notification will be send the next time cron.php is run. 

## Current limitations
- All interface is in danish, and the project has not been prepared to be translated (yet)
- No support for multiple people filling in timesheets / owning timesheets.
- No support for multiple user accounts for the same client. The customer gets a single "account", the employees of the costumer must share that

## Future
I am using the timesheet myself, so I expect it to be actively updated. I have however no plans to extend it beyond my own needs. My heart lies at my other project "picoquery". But I am available as a freelancer, and if I am to get paid for it, I'd love to extend this project. My rate for this will be 100 USD per work hour.

Of course, anybody may fork this project, if they wish, or join in as a collaborator.


