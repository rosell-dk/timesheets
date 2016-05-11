// Note: jQuery required!

/**
 *  Get the value of an INPUT field, referenced by element ID.
 *  Ie if you have <input id="bananas" value="3">, you can reference the value like this: #banana, Ie CONCAT("You have eaten ", #bananas, " bananas")
 */
Formula.addParser(function(text) {
  if (text[0] != '#') {
    return
  }
  var elm = document.getElementById(text.substr(1));
  if (elm) {
    // Return a "Bound variable". (an object with a getValue() function, and a setChangeCallback() function
    return {
      getValue: function () {
        return elm.value;
      },
      setChangeCallback: function(changeCallback) {
        // TODO: do not depend on jQuery
        $(elm).bind("change", changeCallback);
      },
      removeChangeCallback: function(changeCallback) {
        // TODO: do not depend on jQuery
        $(elm).off("change", changeCallback);
      }
    }
  }
});

