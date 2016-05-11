// Note: jQuery required!

function Reference(getValueCallback, changeCallback) {
  this.getValueCallback = getValueCallback;
  this.changeCallback = changeCallback;
}
Reference.prototype.getValue = function() {
  return this.getValueCallback();
}
Reference.prototype.setChangeCallback = function(cb) {
  this.changeCallback(cb)
}


/**
 *  References INPUT fields.
 */

function InputReference(elm) {
  this.elm = elm;
}
InputReference.prototype.getValue = function() {
  return this.elm.value;
}
InputReference.prototype.setChangeCallback = function(changeCallback) {
  $(this.elm).bind("change", changeCallback);
}

/*

function BoundVariable() {
}
BoundVariable.prototype.getValue = function() {
}
BoundVariable.prototype.setValue = function() {
}



function booleanParser(text) {
  if (text.toLowerCase() == 'false') {
    return false;
  }
  if (text.toLowerCase() == 'true') {
    return true;
  }
}

Formula.addParser(numberParser, 0);


function HashReference() {
}
InputReference.prototype.parse = function() {
  if 
}

Formula.addParser(HashReference);

'#', function (ref){
  return new InputReference(ref)
});


BoundVariable.prototype.getValue = function() {
}
BoundVariable.prototype.setValue = function() {
}
*/

