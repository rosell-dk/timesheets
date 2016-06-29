<?php
include_once('inc/password-protected.inc');
?>

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Timesedler</title>
  <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">

  <script src="js/plugins.min.js"></script>

  <!-- We need the jquery ui styles for the autocomplete in the "tasks" field -->
  <link rel="stylesheet" href="http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.min.css">

  <!-- masked input plugin -->
  <!--<script src="plugins/jquery.maskedinput.min.js"></script>-->

  <script src="js/formula/library/referencetypes/Element.js"></script>
  <script src="js/formula/library/datatypes/SimpleTime.js"></script>
  <script src="js/formula/library/datatypes/boolean.js"></script>
  <script src="js/formula/library/datatypes/number.js"></script>
  <script src="js/formula/library/widgets/cell.js"></script>
  <script>
    var isAdmin = <?php echo (isAdmin() ? 'true' : 'false') ?>;
  </script>
  <script src="js/timesheet.js"></script>
  <script src="js/moment-locale-da.js"></script>

  <script src="js/manage-notifications.js"></script>

<?php if (isAdmin()) { ?>
  <script src="js/admin.js"></script>
  <script src="js/admin-create-timesheet.js"></script>
  <script src="js/admin-create-customer.js"></script>
  <script src="js/admin-edit-description.js"></script>
  <link rel="stylesheet" href="css/timesheet-admin.css">


<?php } ?>
  <link rel="stylesheet" href="css/timesheet.css">
  <link rel="stylesheet" href="css/datepicker.css">

<!--

http://digitalbush.com/projects/masked-input-plugin/
http://keith-wood.name/timeEntry.html
http://www.sitepoint.com/10-jquery-time-picker-plugins/
-->
<style>
  <?php if (!isAdmin()) { ?>
  #sheet tr td.operations * {display: none;}
  <?php } ?>
</style>

</head>
<body>
<div id="logout">Log ud</div>
<table>
  <tr>
    <td id="col1">
      <div id="timesheet_list"></div>
      <br><hr>
      <div id="admin_links">
        <div id="manage_notifications">Tilpas notifikationer</div>
      <?php if (isAdmin()) { ?>
        <div id="create_timesheet" class="no-select">Opret timeseddel</div>
        <div id="create_customer" class="no-select">Opret kunde</div>
        <div id="database_admin" class="no-select"><a href="adminer/db-admin.php?username=<?php global $settings; $dbc=$settings['database_connection']; echo $dbc['user'] . '&db=' . $dbc['database'] ?>" class="no-select" target="_blank">Database admin</a></div>
      <?php } ?>
      </div>
    </td>
    <td id="col2">
      <table><tr><td><h1 id="timesheet_title">Timesheet</h1></td><td><div id="timesheet-working"></div></td></tr></table>
      <?php if (isAdmin()) { ?>
        <button id="startworking">Start arbejde!</button>
        <button id="stopworking">Stop arbejde!</button>
        <!--<button id="save">Gem</button>-->
        <br><br>
      <?php } ?>
      <div id="timesheet-meta">        
        <div class="timesheet-description">
          <span id="timesheet-description"></span>
          <?php if (isAdmin()) { ?>
            <span id="edit-description" class="no-select">[rediger]</span>
          <?php } ?>
        </div>
      </div>
      <table id="sheet">
        <tr>
          <th>Dato</th>
          <th>Start</th>
          <th>Slut</th>
          <th>Tidsforbrug</th>
          <th>Opgave</th>
          <th>Noter</th>
        </tr>
        <tr id="template_row">
          <td class="date-col"><input class="date" data-colname="date" data-data></input></td>
          <td class="starttime-col"><input class="starttime" data-colname="starttime" data-data></input></td>
          <td class="endtime-col"><input class="endtime" data-colname="endtime" data-data></input></td>
          <td class="usedtime-col"><input class="usedtime" data-colname="usedtime"></input></td>
          <td class="task-col"><input class="task" data-colname="task" data-data></input></td>
          <td><input class="note" data-colname="note" data-data></input></td>
          <td class="operations"><span class="remove no-select">x</span><span class="insert no-select">+</span></td>
        </tr>
      </table>
      <p>
      I alt: <input id="total" disabled="disabled"></input>
      </p>
    </td>
    <td id="col3">
      <h3>Task breakdown<br><span class="subheader">(ordnet efter opgave-start)</span></h3>
      <div id="breakdown-output"></div>
      <input id="breakdown" type="hidden"></textarea>
    </td>
  </tr>
</table>
<div id="dialog_manage_notifications" title="Tilpas notifikationer">
  <form>
<?php if (isAdmin()) { ?>
    <label for="notifications_customer">Kunde</label>
    <select id="notifications_customer"></select>
<?php } ?>
    <label for="notifications_emails">Emails (komma-separeret)</label>
    <input type="text" id="notifications_emails"><br>
    <label for="notifications_events">Notifikationer</label>
    <select id="notifications_events" multiple="multiple"></select>
    <!-- Allow form submission with keyboard without duplicating the dialog button -->
    <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
  </form>
</div>
<?php if (isAdmin()) { ?>
<div id="dialog_create_timesheet" title="Opret timeseddel">
  <form>
    <label for="createsheet_title">Titel</label>
    <input type="text" id="createsheet_title"><br>
    <label for="createsheet_customer">Kunde</label>
    <select id="createsheet_customer"></select>
    <label for="createsheet_description">Beskrivelse</label>
    <textarea id="createsheet_description"></textarea>
    <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
  </form>
</div>
<div id="dialog_create_customer" title="Opret kunde">
  <form>
    <label for="createcustomer_companyname">Firma</label>
    <input type="text" id="createcustomer_companyname"><br>
    <label for="createcustomer_login">Login</label>
    <input type="text" id="createcustomer_login"><br>
    <label for="createcustomer_password">Adgangskode</label>
    <input type="text" id="createcustomer_password"><br>
    <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
  </form>
</div>
<div id="dialog_edit_description" title="Rediger beskrivelse">
  <form>
    <label for="editdescription_description">Beskrivelse</label>
    <textarea id="editdescription_description"></textarea>
    <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
  </form>
</div>

<?php } ?>
</body>
</html>
