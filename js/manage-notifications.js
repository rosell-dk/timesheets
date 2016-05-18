
$(function() { 

  var manageNotificationsDialog = $( "#dialog_manage_notifications" ).dialog({
    autoOpen: false,
    height: 600,
    width: 500,
    modal: true,
    buttons: {
      "Udfør": function() {
        var emails = $('#notifications_emails').val();
        var events = $('#notifications_events').val();
        if (events == null) {
          events = [];
        }
        var customerId = $('#notifications_customer').val();

        var data = {customer_id: customerId, emails: emails, events: JSON.stringify(events)};
        ajax('set_notifications', data, 'Kunne ikke opdatere notifikationer.', function(data) {
          manageNotificationsDialog.dialog( "close" );
        });
      },
      "Annuler": function() {
        manageNotificationsDialog.dialog( "close" );
      }
    },
    close: function() {
      manageNotificationsDialog.find('form')[ 0 ].reset();
    }
  });

  function getNotifications(customerId) {
    ajax('get_notifications', {customer_id: customerId}, 'Kunne ikke hente notifikations-indstillingerne.', function(data) {
      $('#notifications_emails').val(data.emails);
      $('#notifications_events').val(data.events);

      manageNotificationsDialog.dialog( "open" );
    });
  }

  $('#manage_notifications').click(function () {
    $notificationsSelect = manageNotificationsDialog.find('#notifications_events');
    $notificationsSelect.find('*').remove();

/*
    var events = [
      {"id":"1","event_name":"timesheet_work_started"},
      {"id":"2","event_name":"timesheet_work_ended"}
    ];

    for (var i=0; i<events.length; i++) {
      $notificationsSelect.append('<option value="' + events[i]['id'] + '">' + events[i]['event_name'] + '</option>');
    }*/

    var events = [
      {"event_name":"timesheet_work_started"},
      {"event_name":"timesheet_work_ended"},
      {"event_name":"timesheet_task_switched"}
    ];

    for (var i=0; i<events.length; i++) {
      $notificationsSelect.append('<option value="' + events[i]['event_name'] + '">' + events[i]['event_name'] + '</option>');
    }

/*
    ajax('get_available_events', {}, 'Kunne ikke hente liste over events.', function(data) {
      console.log(data);
      for (var i=0; i<data.length; i++) {
        $notificationsSelect.append('<option value="' + data[i]['id'] + '">' + data[i]['event_name'] + '</option>');
      }
    });*/

    if (isAdmin) {
      $customersSelect = manageNotificationsDialog.find('#notifications_customer');
      $customersSelect.find('*').remove();

      ajax('get_customer_list', {}, 'Kunne ikke hente liste over kunder.', function(data) {
        for (var i=0; i<data.length; i++) {
          $customersSelect.append('<option value="' + data[i]['id'] + '">' + data[i]['companyname'] + '</option>');
        }
        $customersSelect.on('change', function() {
          getNotifications($customersSelect.val());
        });
        getNotifications($customersSelect.val());
      });
    }
    else {
      getNotifications(0);
    }
  });

});

