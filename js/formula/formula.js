var Formula = function(formula, resultChangedCallBack, backReference) {

  // Enable the one who creates the Formula to get itself
  this.backReference = backReference;

  this.resultChangedCallBack = resultChangedCallBack;

  thisFormula = this;

  // Detect endless recursion
  this.numberOfCalculationsLately = 0;
  window.setInterval(function () {
    if (thisFormula.numberOfCalculationsLately > 10) {
      alert('oh-oh. Too much recursion. Stopping formula: ' + options.formula);
      thisFormula.stoppedBecauseTooMuchRecursion = true;
    }
    thisFormula.numberOfCalculationsLately = 0;

  }, 100);

  this.formulaFragment = Formula.parseFormula(formula, this);

  this.bindReferences();
}

/* Bind references (aka Bound variables) */
Formula.prototype.bindReferences = function() {
  if (this.formulaFragment !== undefined) {
    this.formulaFragment.addChangeHandlers(this);
  }
}

Formula.prototype.unbindReferences = function() {
  if (this.formulaFragment !== undefined) {
    this.formulaFragment.removeChangeHandlers(this);
  }
}

Formula.prototype.triggerChangeCallback = function() {
  if (typeof this.resultChangedCallBack == 'function') {
    this.resultChangedCallBack();
  }
}

Formula.prototype.calc = function() {
  if (this.parseError()) {
    return 'Invalid formula';
  }
  return this.formulaFragment.calc();
}

Formula.prototype.referenceChanged = function(reference) {
//  console.log('Formula.referenceChanged() called. New value:' + reference);
  this.resultChangedCallBack();
}

Formula.prototype.parseError = function() {
  return (this.formulaFragment === undefined);
}

Formula.parseFormula = function(formula, formulaObj) {
//  console.log('parsing formula:' + formula)

  var pos;
  var functionLevel = 0;

  // We eat up the formula from left to right
  // meal contains what is not yet eaten
  var meal = formula.trim();

  // Output is an array of parsed tokens
  var output = []

  // RegEx's for sniffing
  var reSniffFunction = /^([A-Z_\$]+[0-9A-Z_\$]*)\(/
  var reSniffNumber = /^[-+]?[0-9]/
  
  // RegEx's for parsing
  var reParseNumber = /^([-+]{0,1}(?:(?:[0-9]+[.][0-9]+)|(?:[0-9]+)))/
  var reFindString = /^"((?:[^"]|"")*)"/
  var reUndoublequoteString = /""/

  var i=0;

  mainloop:
  while ((meal != '') && (i<99)) {
    meal = meal.trimLeft();
    i++
    // parse function start
    if (reSniffFunction.test(meal)) {
      functionLevel++;

      var fname = reSniffFunction.exec(meal)[1];
      if (!(Formula.functions[fname])) {
//        console.log('Function: ' + fname + ' has not been defined. Parse error!');
        return;
      }
      output.push(-1);   // -1: FUNCTION_START
      output.push(fname)
      meal = meal.substr(meal.indexOf('(') + 1);
      continue;
    }


    // parse number
    if (reSniffNumber.test(meal)) {
      var result = reParseNumber.exec(meal);
//      console.log('parsing number' + meal);
//      console.log(result);
      if (result == null) {
        return;
      }
      var n = parseFloat(result[1]);
      if (isNaN(n)) {
        return;
      }
      output.push(-4);   // -4: Simple value
      output.push(n);
      meal = meal.substr(result[0].length);
      continue;
    }

    // In Excell, only doublequotes can be used for strings. Same here
    if (meal[0] == '"') {

      // doublequotes are escaped with two doublequotes ie: "They call me ""the guy"""
      // we must skip those
      var result = reFindString.exec(meal);
      if (result == null) {
        console.log('Parser found something that looked like a string, but wasnt. Parse error!');
        return;
      }
      var str = result[1].replace(/""/g, '"');
      output.push(-4);   // -4: Simple value
      output.push(str);
//      console.log('string value:' + str);

      meal = meal.substr(result[0].length);
      continue;
    }

    // Our build in parsers haven't found anything.
    // Hand leftovers to the custom parsers
    var isAtEndOfFunction = ((functionLevel > 0) && ((meal[0] == ',') || (meal[0] == ')')));

    if (!isAtEndOfFunction) {

      // Eat away, till next ',' or ')'
  //    var re = /^([^,\)]+)[,\)]/
      var re = /^([^,\)]+)(?:$|[,\)])/
      var result = re.exec(meal);
      if (result == null) {
        return;
      }
      var text = result[1];
//console.log('leftovers:' + text);

      meal = meal.substr(text.length);
//console.log('meal left:' + meal);

      for (var j=0; j<Formula.parsers.length; j++) {
        var parseResult = Formula.parsers[j](text, formulaObj);
        if (parseResult !== undefined) {
          // A match!
          output.push(-4);   // -4: Simple value
          output.push(parseResult);
          continue mainloop;
        }
      }

      // Alas. No match at all. This is a parse error
      return
    }


    if (functionLevel > 0) {
      // we should now be at a "," or a ")"
      if (meal[0] == ',') {
        meal = meal.substr(1);
      }
      else if (meal[0] == ')') {
        functionLevel--;
        output.push(-2);   // -2: FUNCTION_END;
        meal = meal.substr(1);
      }
      else {
        return null;
      }
    }
  }

//  console.log('output:')
//  console.log(output);

  // Next, process output to create Formula.Fragments
  var i=0;

  // If formula is just a simple value, wrap the whole formula it in a dummy function
  // This is needed because Formula.Fragment expects a function
  if (output[0] == -4) {
    output.unshift(-1, 'PASSTHROUGH');
    output.push(-2);
  }

  // When called i must point to Simple value, or FUNCTION_START
  // When returning, i points to element after
  function processExpression() {
    if (output[i] == -1) {  // -1: FUNCTION_START
      var fragment = processFunction();
      if (fragment === undefined) {
        return
      }
      return fragment;
    }
    else if (output[i] == -4) { // -4: Simple value
      i=i+2;
      return output[i-1];
    }
    else {
//      console.log('Unexpected token. Expected FUNCTION_START or SIMPLE_VALUE. Got: ' + output[i] + '. exiting');
      return;
    }
  }

  // When called, i must point to FUNCTION_START
  // When returning, i points to element after
  function processFunction() {
    if (output[i] != -1) {
//      console.log('Unexpected token. Expected FUNCTION_START. exiting');
      return;
    }
    i++;
    var fname = output[i];
//    console.log('fname:' + fname);
    i++;
    var parameters = [];

    // grap arguments
    while (output[i] != -2) { // -2: FUNCTION_END

      // grap argument
      parameters.push(processExpression());
      if (parameters[parameters.length - 1] === undefined) {
        return;
      }
    }
    i++;
//    console.log('Parsed function: ' + fname + '. Parameters:');
//    console.log(parameters);
    return new Formula.Fragment(fname, parameters, formulaObj)
  }

  var frag = processFunction();
//  console.log('frag:');
//  console.log(frag);
  return frag;

// new Formula.Fragment(fname, parameters, parameters, formulaObj)

//  console.log('meal:' + meal);

//  alert(isFunction(0));
}


/* Functionality for adding functions */
Formula.function_names = [];
Formula.functions = {};

Formula.addFunction = function(fname, fn) {
  Formula.function_names.push(fname);
  Formula.functions[fname] = fn;
}

Formula.addFunctions = function() {
  for (var i=0; i<arguments.length; i++) {
    Formula.function_names.push(arguments[i][0]);
    Formula.functions[arguments[i][0]] = arguments[i][1];
  }
}

Formula.addFunction('PASSTHROUGH', function(val) {
  return val;
});


/* Functionality for adding parsers */
Formula.parsers = [];
Formula.addParser = function(parserFn, weight) {
  // No weight specified, then add it last
  if (weight === undefined) {
    Formula.parsers.push(parserFn);
  }
  else {
    weight = Math.min(weight, Formula.parsers.length)
    Formula.parsers.splice(1, 0, parserFn);
  }
}


// Add Boolean parser
Formula.addParser(function(text) {
  if (text.toLowerCase() == 'false') {
    return false;
  }
  if (text.toLowerCase() == 'true') {
    return true;
  }
});




/* --------------------- */
/* Class Formula.Frament */
/* --------------------- */

Formula.Fragment = function(fname, parameters, formulaObj) {
  this.fname = fname;
  this.parameters = parameters;
  this.formulaObj = formulaObj;
}

Formula.Fragment.prototype.calc = function() {

  // First, resolve parameters to actual values. Ie:
  // - $('#oranges') => '12'
  // - formula => result of formula

  var values = [];
  for (var i=0; i<this.parameters.length; i++) {
    var p = this.parameters[i];
    if (p instanceof Formula.Fragment) {
      p = p.calc();
    }
    else if (typeof p['getValue'] === 'function') {
      p = p.getValue();
    }
    values.push(p)
  }

  // Next, apply the function
  var thisForCustomFunctions = {
    formula: this.formulaObj
  }
  var result = Formula.functions[this.fname].apply(thisForCustomFunctions, values);
  return result;
}

/* Add change handlers to all references in this formula */
Formula.Fragment.prototype.addChangeHandlers = function(formula) {
  for (var i=0; i<this.parameters.length; i++) {
    var p = this.parameters[i];
    if (p instanceof Formula.Fragment) {
      p.addChangeHandlers(formula);
    }

    // Handle reference
    else if (typeof p['setChangeCallback'] === 'function') {
      p.setChangeCallback(function() {
        formula.referenceChanged(this);
      });
    }
  }
}

/* Remove change handlers to all references in this formula */
Formula.Fragment.prototype.removeChangeHandlers = function(formula) {
  for (var i=0; i<this.parameters.length; i++) {
    var p = this.parameters[i];
    if (p instanceof Formula.Fragment) {
      p.removeChangeHandlers(formula);
    }

    // Handle reference
    else if (typeof p['removeChangeCallback'] === 'function') {
      p.removeChangeCallback(function() {
        formula.referenceChanged(this);
      });
    }
  }
}


