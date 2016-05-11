// Note: jQuery required!

/**
 *  Reference dom nodes with jQuery expressions
 *  Can be used to get values from form elements such as input, select, radiobutton, checkbox and textarea
 *
 *  It is ok to write expressions that returns multiple elements.
 *  In that case, an array of refences will be returned, and the parser treats them like it was multiple parameters to a call.
 *  Example:
 *  The document has three inputs with class attribute "fruit". To sum them all, you can write: SUM($.fruit). The SUM function
 *  will receive three parameters (datatype: string - so the SUM function should convert its arguments to numbers for this example to work)
 *
 *  For checkboxes and radiobuttons, a boolean is returned indicating if its checked or not
 *  Radiobutton groups are not currently supported.
 *
 *  Get the value from a text input, by id:         $['#the_id']
 *  Get the value from a text input, by name attr:  $["[name=apples]"]
 *  Get the value from a dropdown select:           $['select.foo']
 *  Get the value from a checked checkbox:          $['input:checkbox:checked']
 *  Get the value from a set of radio buttons:      $['input:radio[name=bar]:checked']
 *
 */

function JQueryNodeSelector($node) {
  this.$node = $node;
}
JQueryNodeSelector.prototype.getValue = function() {
  if ((this.$node.is(':checkbox')) || (this.$node.is(':radio'))) {
    return this.$node.is(':checked');
  }
  else {
    return this.$node.val();
  }
}
JQueryNodeSelector.prototype.setChangeCallback = function(changeCallback) {
  this.$node.bind("change", changeCallback);
}
Formula.addReferenceType('$[', function(ref) {
  var re = /^('|")(.*)\1\s*\]$/
  var result = re.exec(ref);
  if (result == null) {
    return [];
  }
  $refs = $(result[2]);
  var refs = [];
  $refs.each(function() {
    refs.push(new JQueryNodeSelector($(this)));
  });
  return refs;
});
