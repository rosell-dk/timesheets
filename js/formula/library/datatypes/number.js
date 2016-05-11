function numVal(obj) {
  if (typeof obj == 'number') {
    return obj;
  }
  if (typeof obj == 'string') {
    if (obj == '') {
      return 0;
    }
    return parseFloat(obj);
  }
  alert('could not deformat number: ' + obj);
}

Formula.addFunctions(
  ['SUM', function() {
    var result=0;
    for (var i=0; i<arguments.length; i++) {
      result += numVal(arguments[i]);
    }
    return result;
  }],
  ['SUBTRACT', function(a,b) {
    return numVal(a) - numVal(b);
  }],
  ['MULTIPLY', function() {
    var result=1;
    for (var i=0; i<arguments.length; i++) {
      result *= numVal(arguments[i]);
    }
    return result;
  }],
  ['DIVIDE', function() {
    var result = numVal(arguments[0]);
    for (var i=1; i<arguments.length; i++) {
      result /= numVal(arguments[i]);
    }
    return result;
  }],
  ['ROUND', function(num) {
    return Math.round(numVal(num));
  }]
);

