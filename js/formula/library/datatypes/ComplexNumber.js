function ComplexNumber(a, b) {
  this.a = a;
  this.b = b;
}
ComplexNumber.prototype.toString = function() {
  if (this.b > 0) {
    return '(' + this.a + ' + ' + this.b + 'i)';
  }
  return '(' + this.a + ' - ' + (-this.b) + 'i)';
}

Formula.addFunction('COMPLEXNUMBER', function(a, b) {
  return new ComplexNumber(a, b);
});

Formula.addFunction('ADD_TWO_COMPLEX_NUMBERS', function(cn1, cn2) {
  return new ComplexNumber(cn1.a + cn2.a, cn1.b + cn2.b);
});

Formula.addFunction('FORMAT_COMPLEX_NUMBER', function(cn) {
  return cn.toString();
});

Formula.addFunction('PARSE_COMPLEXNUMBER', function(s) {
  var re = /\(([+-]?[0-9.]*)\s*([+-])\s*([0-9.]*)\s*i\s*\)/
  var result = re.exec(s);
  if ((result != null) && (result.length == 4)) {
    return new ComplexNumber(parseFloat(result[1]), parseFloat(result[2]+result[3]));
  }
  else {
    // parse error
    return new ComplexNumber(NaN, NaN);
  }
});

