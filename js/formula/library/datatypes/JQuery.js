
Formula.addFunction('$', function(a, b) {
  return $(a,b);
});


Formula.addFunction('$$', function(a, b) {
  
  var $jq = $(a,b);
  var formula = this.formula;

  function changeHandler() {
    formula.triggerChangeCallback();
  }

  $jq.each(function () {
    if (!(jQuery.data($(this).get(0), 'added-handler'))) { 
      $(this).on("change", changeHandler);
      jQuery.data($(this).get(0), 'added-handler', true);
    }
  })

  return $jq;
});

Formula.addFunction('$VAL', function($jq) {
  return $jq.val();
});

Formula.addFunction('$ATTR', function($jq, attrName) {
  return $jq.attr(attrName);
});

