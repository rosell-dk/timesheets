
$(function() { 

  var createTimesheetDialog = $( "#dialog_create_timesheet" ).dialog({
    autoOpen: false,
    height: 400,
    width: 600,
    modal: true,
    buttons: {
      "Opret": function() {
        var title = $('#createsheet_title').val();
        var customerId = $('#createsheet_customer').val();
        var description = $('#createsheet_description').val();
        if (title == '') {
          return;
        }
        var data = {title: title, customer_id: customerId, active: 1, billed: 0, fixed_price: 0, description: description};
        ajax('create_sheet', data, 'Kunne ikke oprette timeseddel.', function(data) {
          loadSheetList();
          createTimesheetDialog.dialog( "close" );
        });

      },
      "Annuler": function() {
        createTimesheetDialog.dialog( "close" );
      }
    },
    close: function() {
      createTimesheetDialog.find('form')[ 0 ].reset();
    }
  });
 
  $('#create_timesheet').click(function () {
    $customersSelect = createTimesheetDialog.find('#createsheet_customer');
    $customersSelect.find('*').remove();

    ajax('get_customer_list', {}, 'Kunne ikke hente liste over kunder.', function(data) {
      console.log(data);
      for (var i=0; i<data.length; i++) {
        $customersSelect.append('<option value="' + data[i]['id'] + '">' + data[i]['companyname'] + '</option>');
      }
    });

    createTimesheetDialog.dialog( "open" );
  });

});

