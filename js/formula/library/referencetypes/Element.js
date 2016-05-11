// Note: jQuery required!

/**
 *  Multiple syntaxes for referencing property of a DOM node
 *
 *  The reference is parsed into two parts.
 *  First part dictates how to find the input element.
 *  Examples: 
 *    '#bananas' - also find the element by id (in this case: id=bananas)
 *    '@bananas' - find the element by name (in this case: name=bananas)
 *    '#id:bananas' - another syntax for finding the element by id (deprecated)
 *    '#name:bananas' - another syntax for finding the element by name  (deprecated)
 *
 *  The second part tells what to return
 *    '#bananas.value' - Return the value of the input
 *    '#bananas.element' - Return the input element itself
 *    '#bananas.attr:class  - Return the attribute (in this case the "class" attribute)
 *    '#bananas.propertyname  - Return any named property on the DOM node. Ie. #bananas.checked will return the checked property
 *
 */
Formula.addParser(function(text) {
  if ((text[0] != '#') && (text[0] != '@')){
    return
  }
  var parts = text.split('.');

  var sel = parts[0];
  var valuePart = parts[1];

  var elm;
  if (sel.substr(0, 4) == '#id:') {
    elm = document.getElementById(sel.substr(4));
  }
  else if (sel.substr(0, 6) == '#name:') {
    elm = $("[name='" + sel.substr(6) + "']").get(0);
  }
  else if (sel[0] == '#') {
    elm = document.getElementById(sel.substr(1));
  }
  else if (sel[0] == '@') {
    elm = $("[name='" + sel.substr(1) + "']").get(0);
  }

  if (elm) {
    // Return a "Bound variable". (an object with a getValue() function, and a setChangeCallback() function
    return {
      getValue: function () {
        if (valuePart === undefined) {
          return elm.value;
        }
        if (valuePart.substr(0, 5) == 'attr:') {
          return $(elm).attr(valuePart.substr(5));
        }
        switch (valuePart) {
          case 'undefined':
          case 'value':
            return elm.value;
          case 'element':
            return elm;
          default:
            return elm[valuePart];
        }
      },
      setChangeCallback: function(changeCallback) {
        // TODO: do not depend on jQuery
        $(elm).on("change", changeCallback);
      },
      removeChangeCallback: function(changeCallback) {
        // TODO: do not depend on jQuery
        $(elm).off("change", changeCallback);
      }
    }
  }
});

