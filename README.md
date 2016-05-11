# timesheets
Create excell-like timesheets and let your customers view them

## Screenshot
![Screenshot](/screenshot.png?raw=true "Screenshot")

## Features
- Datepicker, timepickers allows quick selection of date and time
- When entering tasks, you can quickly select existing tasks
- Overview with work hours per task, which updates instantly.
- Sheet is saved almost instantly (1 second after last change)
- Customers can be allowed to log in and view their timesheets (not edit)
- Customers can opt in for notifications when work starts, etc


## Installation
- Create a mysql database (ie: CREATE DATABASE timesheets CHARACTER SET utf8)
- Fill it with data from the file SQL.txt (ie mysql -u username -p timesheets < SQL.txt)
- Copy 'default.setting.inc' to 'settings.inc'
- Enter database settings and admin password
- Log in as admin. You can now create timesheets and customers.
- Currently, the system can only send notifications through ifttt.com. You will need an ifttt.com account, and you will need to subscribe to the called "Maker". Doing that provides you with a key, which you must insert in settings.inc. And finally, you will need to set create a recipee "send_email": IF Maker event "send_email" THEN Send an email to: [Value1], subject: [Value2], body: [Value3]

## Limitations
- Currently all interface is in danish, and the project has not yet been prepared to be translated


