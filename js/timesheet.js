
var currentSheetId;
var currentSheet;
var isSettingSheetData = false;

function timeOrEmptyFormatter(obj) {
  if ((obj == null) || ((typeof obj == 'string') && (obj == ''))){
    return '';
  }
  return obj.format();
}

function timeOrEmptyDeformatter(text) {
  if ((text == null) || (text == '')){
    return '';
  }
  return SimpleTime.parse(text);
}

function twoDigitsFormatter(num) {
  if (typeof num == 'string') {
    // assume it is already formatted
    return num;
  }
  if (typeof num == 'number') {
    var text = num.toFixed(2);
//      text = text.replace('.', ',');
    return text;
  }
}
function factoryHoursFormatter(num) {
//  console.log(num);
//  console.log(typeof num)
  var text = twoDigitsFormatter(num);
  text = text.replace('.', ',');
  if (text.length > 0) {
    text += 't';
  }
  return text;
}

function fieldValue($elm) {
  if ($elm.hasClass('cell')) {
    return $elm.cell('getValue');
  }
  return $elm.val();
}

Formula.addFunctions(
  ['$SUM', function($jq) {
    var result=0;
    $jq.each(function() {
//        result += parseFloat($(this).val());

      // Beware, it can happen that the cells arent widgetized yet
      // Only count, when we are sure it has been
      if ($(this).hasClass('cell')) {
        result += numVal($(this).cell('getValue'));
      }
    });
    return result;
  }],
  ['$BREAKDOWN', function($usedTimes, $tasks) {
    var taskTimes = {};
    var tasks = [];
    for (var i=0; i<$tasks.length; i++) {
      var task = $tasks[i].value;
      if ((task == '') || (task == undefined)) {
        task = '[unspecified]';
      }

      if (taskTimes[task] === undefined) {
        taskTimes[task] = 0;
        if (task != '[unspecified]') {
          tasks.push(task);
        }
      }
    }
    for (var i=0; i<$usedTimes.length; i++) {
//        var formattedTime = $usedTimes[i].value;
      var usedTime = fieldValue($($usedTimes[i]));
      if (typeof usedTime == 'number') {
        var task = $($usedTimes[i]).closest('tr').find('[data-colname=task]').val();
        if (task == '') {
          task = '[unspecified]';
//console.log(usedTime);
//console.log($($usedTimes[i]).cell);
        }
        taskTimes[task] += usedTime;
      }
    }

    // Right now, tasks are in order of appearance.
    // Would you rather, they were ordered alphabetically? 
    // Then do this:
    //     tasks.sort();
    

    var total = 0;
    var text = '<table>';
    for (var i=0; i<tasks.length; i++) {
      var task = tasks[i];
      if (taskTimes[task] == 0) {
        continue;
      }
      total += taskTimes[task];
      text += '<tr class="task' + ((i==tasks.length-1) ? ' last':'') + '"><td>' + task + '</td><td>' + factoryHoursFormatter(taskTimes[task]) + '</td></tr>';
    }
    if ((taskTimes['[unspecified]']) && (taskTimes['[unspecified]'] > 0)) {
      text += '<tr class="unspecified"><td>Uspecificeret</td><td>' + factoryHoursFormatter(taskTimes['[unspecified]']) + '</td></tr>';
      total += taskTimes['[unspecified]'];
    }
    text += '<tr class="total"><td>I alt</td><td>' + factoryHoursFormatter(total) + '</td></tr>';
    text += '</table>';
    $('#breakdown-output').html(text);
    
    return '';
  }],
  ['USEDTIME', function(startTimeStr, endTimeStr) {
    //IF(AND(SIMPLETIME_IS_VALID(SIMPLETIME_PARSE(row:endtime)),SIMPLETIME_IS_VALID(SIMPLETIME_PARSE(row:starttime))),SIMPLETIME_SUBTRACT(SIMPLETIME_PARSE(row:endtime),SIMPLETIME_PARSE(row:starttime)), "")
//      if ((startTime == null) || (endTime == null)) {
    var startTime = SimpleTime.parse(startTimeStr);
    var endTime = SimpleTime.parse(endTimeStr);
    if ((!SimpleTime.isValidSimpleTime(startTime)) || (!SimpleTime.isValidSimpleTime(endTime))) {
//        console.log(startTime);
      // Let empty string indicate that it cannot be calculated yet.
      // factoryHoursFormatter will make sure to format accordingly (as empty cell)
      // $SUM can handle empty strings
      return '';
    }
//console.log('used time set to:' + SimpleTime.subtract(endTime, startTime).toFactoryTime());
    return SimpleTime.subtract(endTime, startTime).toFactoryTime();

  }]
);

// Add "row:" reference-parser, which can reference a cell value in current row (tr)
Formula.addParser(function(text, formulaObj) {
  if (text.substr(0,4) != 'row:') return
  var columnClass = text.substr(4);

  var $cell = formulaObj.backReference;
  var $elm = $cell.closest('tr').find('.' + columnClass);

  if ($elm.length == 0) {
    return '#REF error';
  }
  return {
    getValue: function () {
      return fieldValue($elm);
    },
    setChangeCallback: function(changeCallback) {
      $elm.on("change", changeCallback);
    },
    removeChangeCallback: function(changeCallback) {
      $elm.off("change", changeCallback);
    }
  }
});

// Add "." reference-parser, which can reference SEVERAL cells
// getValue returns a jquery object containing matched elements.
// If you are going to have dynamic HTML, which will cause match to change,
// you will have to run "unbindReferences()" on the cell widget / formula before the change,
// and "bindReferences()" after the change
Formula.addParser(function(text, formulaObj) {
  if (text[0] != '.') return
  var className = text.substr(1);

  var $elementsWithChangeHandlers;

  return {
    getValue: function () {
      return $(text);
    },
    setChangeCallback: function(changeCallback) {
      $elementsWithChangeHandlers = $(text);
      $elementsWithChangeHandlers.on("change", changeCallback);
    },
    removeChangeCallback: function(changeCallback) {
      $elementsWithChangeHandlers.off("change", changeCallback);
    }
  }
});

$.timeEntry.setDefaults({show24Hours: true, spinnerImage: ''});

function addRow() {
  $row = $('#template_row').clone();
  $row.removeAttr('id');

  // Clear all values, because browser may have autofilled some
  $row.find('input').val('');

//    $row.find( ".date" ).mask("99/99/9999",{placeholder:"mm/dd/yyyy"});

  $row.find( ".starttime" ).add($row.find( ".endtime" )).cell( {
//      formatter: timeOrEmptyFormatter,
//      deformatter: timeOrEmptyDeformatter,
//      value: new SimpleTime(10,10)
  });


  $row.find( ".starttime" ).timeEntry();

  $row.find( ".endtime" ).timeEntry({
    beforeShow: function(input) {
      var starttime = $(input).closest('tr').find('.starttime').val();
      return {'defaultTime': starttime}
    },
  });

//.mask("99:99",{placeholder:"HH:mm"});
// $(selector).timeEntry({beforeShow: customRange}); 
/*
function customRange(input) { 
  return {minTime: (input.id === 'tTo' ? 
      $('#tFrom').timeEntry('getTime') : null),  
      maxTime: (input.id === 'tFrom' ? 
      $('#tTo').timeEntry('getTime') : null)}; 
}*/

  $row.find( ".usedtime" ).cell( {
    formula: 'USEDTIME(row:starttime,row:endtime)',
//      formula: 'SUM(1,2)',
    formatter: factoryHoursFormatter,
  }).attr('disabled', 'disabled');

  if (!isAdmin) {
//      $row.find('input').attr('readonly', 'readonly');
    $row.find('input').attr('disabled', 'disabled');
  }

  // We also activate mdatepicker for non-admins, just in order to get the loaded value formatted
  // yep, a bit overkill
  $row.find ( ".date" ).mdatepicker({
    format: 'ddd D. MMM',
    autoHide: false
  });

  if (isAdmin) {
    // https://jqueryui.com/datepicker/
/*    $row.find ( ".date" ).datepicker({
      dateFormat: 'D. d M'
    });*/


    // http://api.jqueryui.com/autocomplete/
    $row.find( ".task" ).autocomplete({
      delay: 10,
      minLength: 0,
      source: function(request, response) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
        var existingTasks = [];
        var tasks = [];
        $('.task').each(function () {
          var task = $(this).val();
          if ((existingTasks[task] == undefined) && (task != '')) {
            existingTasks[task] = true;
            tasks.push(task);
          }
        });
        response( $.grep( tasks, function( value ) {
          value = value.label || value.value || value;
          return matcher.test( value );
        }) );
      }
    });

    $row.find('.remove').click(function() {
      $(this).closest('tr').remove();
      recalcTotals();
      if (isAdmin) {
        saveSheetSoon();
      }
    });

    $row.find('.insert').click(function() {
      unbindReferences();
      addRow();
      
      $row = $('#sheet tr:last-child').detach();
      $row.insertBefore($('#sheet tr:nth-child(' + ($(this).closest('tr').index() + 1) + ')'));
      bindReferences();

      if (isAdmin) {
        saveSheetSoon();
      }
    });
  }

  $row.appendTo('#sheet');

//console.log('addrow');
//console.log(fieldValue($row.find( ".usedtime" )));

  return $row;
}

function setSheetData(data) {

  isSettingSheetData = true;

  // Passivate the field, so it doesn't need to recalculate
  // each time a dependent field is added
  unbindReferences();

  $(document).off('change', addRowIfNeeded);

  // Remove all rows after the template row
  $( "#sheet tr#template_row ~ tr" ).remove();

  for (var row=0; row<data.length; row++) {
    var rowData = data[row];

    $row = addRow();

    // We actually let the template row define what data to look for.
    // (setting the "data-data" attribute is a signal to getSheetData and setSheetData that a
    // field should be set/get (the "data-colname" defines the property)
    $row.find('input[data-data][data-colname]').each(function() {
      var colname = $(this).attr('data-colname');
      if (rowData[colname]) {
        if ($(this).hasClass('cell')) {
          $(this).cell('setValueFromFormattedValue', rowData[colname]);
        }
        else if (colname == 'date') {
          $(this).mdatepicker('set', moment(rowData[colname], 'YYYY-MM-DD'));
        }
        else {
          $(this).val(rowData[colname]);
        }
      }
    });
  }

  if (isAdmin) {
    addRow();
  }

  $('#sheet').find('input').trigger('change');

  // Now, activate it again, and recalculate
  bindReferences();

  recalcTotals();

  if (isAdmin) {
    $(document).on('change', addRowIfNeeded);
  }

  isSettingSheetData = false;

}

// Get sheet data.
// In this example, we get the formatted values.
function getSheetData() {

  var data = [];

  // Get relevant rows (those after the template row)
  $rows =  $( "#sheet tr#template_row ~ tr" );

  $rows.each(function () {
    var rowData = {};
    var emptyRow = true;
    $(this).find('input[data-data][data-colname]').each(function() {
      var colname = $(this).attr('data-colname');
//       var value = $(this).cell('getValue');

      if (colname == 'date') {
        var formattedValue = $(this).val();
        if (formattedValue != '') {
          // Save as ISO 8601 date format
          rowData[colname] = $(this).mdatepicker('get').format('YYYY-MM-DD');
          emptyRow = false;
        }
      }
      else {
        var formattedValue = $(this).val();
        if (formattedValue != '') {
          rowData[colname] = formattedValue;
          emptyRow = false;
        }
      }
    });
    if (!emptyRow) {
      data.push(rowData);
    }
  });

  return data;
}

function unbindReferences() {
  $( "#total" ).cell('unbindReferences');
  $( "#breakdown" ).cell('unbindReferences');
}

function bindReferences() {
  $( "#total" ).cell('bindReferences');
  $( "#breakdown" ).cell('bindReferences');
}

function addRowIfNeeded(e) {

  // Do not add, if user arent allowed to enter data
  if (!isAdmin) {
    return;
  }

  // Do not add, if sheet is being populated
  if (isSettingSheetData) {
    return;
  }

  var $target = $(e.target);

  // Do not add, if input is not in sheet
  if ($target.closest('#sheet').length == 0) {
    return;
  }

  // Do not add, if input is not marked to be saved
  if ($target.attr('data-data') == undefined) {
    return;      
  }

  // Add, if we are in last column
  if ($target.closest('tr').is(':last-child')) {
    unbindReferences();
    addRow();
    bindReferences();
  }
}

function recalcTotals() {
  $('#total').cell('calc');
  $('#breakdown').cell('calc');
}

function ajax(action, data, errorMsg, successCallback) {
  data['action'] = action;

  $.ajax({
    url: 'ajax.php',
    type: 'POST',
    data: data,
    success: function (data, status, jqXHR) {
      if (!(data.success)) {
        if (data.errormsg == 'not logged in') {
          window.location.href = 'timesheets.php';
        }
        else {
          alert(errorMsg + '\n' + data.errormsg);
        }
      }
      else {
        successCallback(data.data);
      }
    },
    error: function() {
      alert(errorMsg);
    }
  })
}

function blink() {
  $('.blink').toggleClass('hidden');
}

/* state must be 0 or 1 */
function setCurrentlyWorkingState(state) {
  currentSheet.currently_working = state;
  if (currentSheet.currently_working == 1) {
    $('#timesheet-working').text('arbejder');
    $('#timesheet-working').addClass('blink');
  }
  else {
    if (isAdmin) {
      $('#timesheet-working').text('arbejder ikke');
    }
    $('#timesheet-working').removeClass('blink');
  }
}

function loadSheet(id) {
  setCookie('last_viewed_timesheet', id);

  $('#col2').css('visibility', 'hidden');

  ajax('get_timesheet', {id:id}, 'Kunne ikke hente timeseddel.', function(data) {
    if (data.data == null) {
      data.data = [];
    }
    setSheetData(data.data);

    if (!isAdmin) {
      // Convert all visible input fields in the sheet to ordinary text
      // - makes it easier for customer to copy/paste the sheet
      $('#sheet tr#template_row ~ tr input').each(function() {
        var text = $(this).val();
        var classAttr = $(this).attr('class');
        if ($(this).attr('readonly')) {
          classAttr += ' readonly'
        }
        var $parent = $(this).parent();
        $(this).remove();
//        $parent.append('<span class="inp ' + classAttr + '">' + text + '</span>');
        $parent.append(text);
        $parent.addClass('inp ' + classAttr);
//        $parent.append(text);
      });
    }

    currentSheetId = id;
    currentSheet = data;
    setCurrentlyWorkingState(data.currently_working);

    $('#timesheet_title').text($('.timesheet-link[data-id=' + id + ']').text());
    colorizeCols();
    $('#col2').css('visibility', 'visible');

//    $('#timesheet-meta *').remove();
    $('#timesheet-description').text(data.description || '');
  });
}

function loadSheetList() {
  ajax('get_timesheet_list', {}, 'Kunne ikke hente liste over timesedler.', function(data) {
    $('#timesheet_list').find('*').remove();
    $('#timesheet_list').append('<h3>Timesedler</h3>');
    $('#timesheet_list').append('<div id="accordion"></div>');

    $accordion = $('#accordion');
    $accordion.append('<h3>Aktive</h3><div id="active"></div>');
    $accordion.append('<h3>Færdige</h3><div id="completed"></div>');
    $accordion.append('<h3>Fakturerede</h3><div id="billed"></div>');

    $active = $('#active');
    $completed = $('#completed');
    $billed = $('#billed');

    $('#show_billed').click(function() {
//      alert()
      $('.timesheet-link').css('display', 'none');
      $('.timesheet-link.billed').css('display', 'block');
      $('#show_billed').text('Vis ikke-fakturerede');
    });

    var doesLastViewedSheetExist = false;
    var lastViewedTimesheetId = getCookie('last_viewed_timesheet');

    for (var i=0; i<data.length; i++) {
      var timesheet = data[i];
      $link = $('<span class="timesheet-link no-select" data-id="' + timesheet['id'] + '">' + timesheet['title'] + '</span>');
      if (timesheet['active'] == 1) {
        $active.append($link);
      }
      else {
        if (timesheet['billed'] == 1) {
          $billed.append($link);
        }
        else {
          $completed.append($link);
        }
      }
      if (timesheet['id'] == lastViewedTimesheetId) { 
        doesLastViewedSheetExist = true;
      }
    }
    $accordion.find('h3').each(function () {
      $(this).text($(this).text() + ' (' + $(this).next().find('.timesheet-link').length + ')');
    });
    $accordion.accordion();
    $('.timesheet-link').click(function() {
      loadSheet($(this).attr('data-id'));
    });
    if (location.search.indexOf('timesheet') != -1) {
      var id = location.search.substr(location.search.indexOf('timesheet') + 10);
      loadSheet(id);      
    }
    else {
      if (doesLastViewedSheetExist) {
        loadSheet(lastViewedTimesheetId);
      }
    }
  });
}    

// http://www.w3schools.com/js/js_cookies.asp
function deleteCookie(cname) {
  document.cookie = cname + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function setCookie(cname, cvalue) {
  var exdays = 300
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();

  document.cookie = cname + '=' + cvalue + ';path=/;' + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function colorizeCols() {
  // Get relevant rows (those after the template row)
  $rows =  $( "#sheet tr#template_row ~ tr" );
  $rows.each(function() {
    $endtime = $(this).find("[data-colname=endtime]");
    $nextstarttime = $(this).next().find("[data-colname=starttime]");
    if ($endtime.val() == $nextstarttime.val()) {
      $endtime.addClass('work-continues');
    }
    else {
      $endtime.removeClass('work-continues');
    }
  });
}

$(function() { 

  moment.locale('da');

  window.setInterval(blink, 800);

  $( "#total" ).cell( {
//      formula: 'SUM(#ex1,FIELD_VALUE(#ex2.element))',
    formula: '$SUM(.usedtime)',
    formatter: factoryHoursFormatter
  });

  $( "#breakdown" ).cell( {
    formula: '$BREAKDOWN(.usedtime, .task)',
  });

  if (isAdmin) {
    $(document).on('change', addRowIfNeeded);
  }

  $(document).on('change', function(e) {
    if (isSettingSheetData) return;
    var colname = $(e.target).attr('data-colname')
    if (!colname) return;
    if ((colname == 'starttime') || (colname == 'endtime')) {
      colorizeCols();
    }

  });


  loadSheetList();

//    startWorking();
    $('#logout').click(function () {
      window.location.href = 'logout.php';
    });
});

