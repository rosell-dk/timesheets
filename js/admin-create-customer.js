
$(function() { 

  var createCustomerDialog = $( "#dialog_create_customer" ).dialog({
    autoOpen: false,
    height: 400,
    width: 400,
    modal: true,
    buttons: {
      "Opret": function() {
        var companyname = $('#createcustomer_companyname').val();
        var login = $('#createcustomer_login').val();
        var password = $('#createcustomer_password').val();

        if ((companyname == '') || (login == '') || (password == '')) {
          alert('alle felter skal udfyldes');
          return;
        }
        var data = {companyname: companyname, login: login, password: password};
        ajax('create_customer', data, 'Kunne ikke oprette kunde.', function(data) {
          createCustomerDialog.dialog( "close" );
        });
      },
      "Annuler": function() {
        createCustomerDialog.dialog( "close" );
      }
    },
    close: function() {
      createCustomerDialog.find('form')[ 0 ].reset();
    }
  });
 
  $('#create_customer').click(function () {
    createCustomerDialog.dialog( "open" );
  });

});

