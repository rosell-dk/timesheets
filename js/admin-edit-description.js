

$(function() { 

  var editDescriptionDialog = $( "#dialog_edit_description" ).dialog({
    autoOpen: false,
    height: 400,
    width: 600,
    modal: true,
    buttons: {
      "Gem": function() {
        var description = $('#editdescription_description').val();
        var data = {key: 'description', value: description, id:currentSheetId};
        ajax('update_timesheet_meta', data, 'Kunne ikke opdatere beskrivelsen.', function(data) {
          loadSheetList();
          editDescriptionDialog.dialog( "close" );
        });

      },
      "Annuler": function() {
        editDescriptionDialog.dialog( "close" );
      }
    },
    close: function() {
      editDescriptionDialog.find('form')[ 0 ].reset();
    }
  });
 
  $('#edit-description').click(function () {
    $('#editdescription_description').val($('#timesheet-description').text());
    editDescriptionDialog.dialog( "open" );
  });

});

