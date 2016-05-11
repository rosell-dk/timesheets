
function saveSheet() {
  id = currentSheetId;
  if (!id) {
    alert('Kunne ikke gemme. Der er ingen aktiv timeseddel');
    return;
  }

  var $row = $('#sheet tr:last-child');
  var $prevRow = $row.prev();

  var data = {
    id: id,
    data: JSON.stringify(getSheetData()),
    total: $('#total').cell('getValue'),
    currently_working: currentSheet.currently_working,
    last_task: $prevRow.find('[data-colname=task]').val(),
    last_starttime: $prevRow.find('[data-colname=starttime]').val(),
    last_endtime: $prevRow.find('[data-colname=endtime]').val(),
  }

  ajax('set_timesheet', data, 'Kunne ikke gemme timeseddel.', function(data) {
  });
}


function startWorking() {
/*
  jQuery datepicker

  var d = new Date();
  var now = new SimpleTime(d.getHours(), d.getMinutes());
  var $row = $('#sheet tr:last-child');
  var $prevRow = $row.prev();

  var $date = $row.find('[data-colname=date]');
  $date.datepicker( "setDate", new Date() );  // "10/12/2012"
  // If there already is such a date present in the sheet, remove it again
  $('#sheet tr:not(:last-child) [data-colname=date]').each(function () {
    if ($(this).val() == $date.val()) {
      $date.val('');
    }
  });
*/

  var d = new Date();
  var now = new SimpleTime(d.getHours(), d.getMinutes());
  var $row = $('#sheet tr:last-child');
  var $prevRow = $row.prev();

  var $date = $row.find('[data-colname=date]');
  $date.mdatepicker( "set", moment() );  // "10/12/2012"
  // If there already is such a date present in the sheet, remove it again
  $('#sheet tr:not(:last-child) [data-colname=date]').each(function () {
    if (this != $date.get(0)) {
      if ($(this).val() == $date.val()) {
        console.log($(this).val())
        console.log('equals');
        console.log($date.val())
        $date.val('');
      }
    }
  });

  var $startTime = $row.find('[data-colname=starttime]');
  $startTime.cell('setValue', now);

  if ($prevRow.length == 1) {
    var $prevEndTime = $prevRow.find('[data-colname=endtime]');
    if ($prevEndTime.val() == '') {
      $prevEndTime.cell('setValue', now);
      $prevEndTime.trigger('change');
    }
  }
  setCurrentlyWorkingState(1);

  $startTime.trigger('change');
//      addRow();
}

function stopWorking() {
  var d = new Date();
  var now = new SimpleTime(d.getHours(), d.getMinutes());
  $endTime = $('#sheet tr:last-child').prev().find('[data-colname=endtime]');
  if ($endTime.val() == '') {
    $endTime.cell('setValue', now);
    $endTime.trigger('change');
  }
  setCurrentlyWorkingState(0);
}

var saveTid;
function saveSheetNow() {
  window.clearTimeout(saveTid);
  saveTid = null;
  saveSheet();
}
function saveSheetSoon() {
  // If a save is pending, cancel it
  if (saveTid) {
    window.clearTimeout(saveTid);
  }
  saveTid = window.setTimeout(saveSheetNow, 1000);
}

$(function() { 

  $(document).on('keydown', function(e) {
    var $target = $(e.target);

    if (($target.is(':input')) && ($target.parents('#sheet').length == 1)) {
      if ((e.key == 'ArrowLeft') && ($target.val() == '')) {
        $target.closest('td').prevAll().find('input:enabled').last().focus().select();
      }
      if ((e.key == 'ArrowRight') && ($target.val() == '')) {
        $target.closest('td').nextAll().find('input:enabled').first().focus().select();
      }/*
      if (e.key == 'ArrowDown') {
        var $nextRow = $target.closest('tr').next();
        $nextRow.find('input[data-colname=' + $target.attr('data-colname') + ']').focus().select();
      }
      if (e.key == 'ArrowUp') {
        var $prevRow = $target.closest('tr').prev();
        $prevRow.find('input[data-colname=' + $target.attr('data-colname') + ']').focus().select();
      }*/
    }
  });
  
  $('#startworking').click(startWorking);
  $('#stopworking').click(stopWorking);
  $('#save').click(saveSheet);

  /* Update working status */
  $(document).on('change', function(e) {
    if (!currentSheet) {
      return;
    }
    var $target = $(e.target);
    if ($target.attr('data-colname') == 'endtime') {
      if (currentSheet.currently_working == 1) {
        if ($target.closest('tr').next().is(':last-child')) {
          setCurrentlyWorkingState(0);
        }
      }
    }
  });

 
  /* Save document after each relevant change */
  $(document).on('change', function(e) {

    // Do not save, if sheet is being populated
    if (isSettingSheetData) {
      return;
    }

    var $target = $(e.target);

    // Do not save, if input is not in sheet
    if ($target.closest('#sheet').length == 0) {
      return;
    }

    // Do not save, if input is not marked to be saved
    if ($target.attr('data-data') == undefined) {
      return;      
    }

    saveSheetSoon();
  });

  
//  timesheet-meta

//    createCustomer('Lejeguiden', 'lejeguiden', 'EhutEueoht83!');
//    createCustomer('Network Communication', 'networkcommunication', 'tanteOlga112');

//    createSheet('Sprint 17', 1);   // 1 = lejeguiden
//    createSheet('Capto', 2);   // 2 = networkcommunication


});

