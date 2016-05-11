/*
Requires: jQuery

With this initializer, you can conveniently create dynamically calculated fields like this:

<input data-formula="ADD_TWO_NUMBERS(10,11)" readonly></input>

*/

jQuery(function() {

  $('[data-formula]').each(function() {
    var $field = $(this);
    var formula = new Formula($(this).attr('data-formula'), function() {
      var oldValue = $field.val();
      $field.val(formula.calc());
      if (oldValue != $field.val()) {
        // Trigger change, in case another formula is listening
        $field.trigger('change');
      }      
    });
    $field.val(formula.calc());
  });

});

