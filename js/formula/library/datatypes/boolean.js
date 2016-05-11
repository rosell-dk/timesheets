Formula.addFunctions(
  ['IF', function(test, a, b) {
    return (test ? a : b);
  }],
  ['ISBLANK', function(text) {
    return (text == '');
  }],
  ['OR', function() {
    for (var i=0; i<arguments.length; i++) {
      if (arguments[i]) {
        return true;
      };
    }
    return false;
  }],
  ['AND', function() {
    for (var i=0; i<arguments.length; i++) {
      if (!arguments[i]) {
        return false;
      };
    }
    return true;
  }],
  ['NOT', function(b) {
    return !b;
  }],
  ['EQ', function(a, b) {
    return (a == b);
  }],
  ['MANUALLY_EDITED', function(elm) {
    return $(elm).hasClass('manually-edited');
  }]
);

