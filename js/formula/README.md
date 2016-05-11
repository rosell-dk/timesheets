# formula
Generic engine for parsing and running excel-like formulas plus a library


## Adding functions
formula is born without any functions. It is however very easy to add a function:

```javascript
Formula.addFunction('ADD_TWO_NUMBERS', function(a, b) {
  return a+b;
});
```

With that function, you can calculate formulas like this:
ADD_TWO_NUMBERS(10, ADD_TWO_NUMBERS(7, 14.2))


## Calculate on any datatype you want
As the engine just moves the variables around ignorantly, you can use it with whatever data type you like.

Thus you can for example enable the engine to work with complex numbers this way:

```javascript
function ComplexNumber(a, b) {
  this.a = a;
  this.b = b;
}

Formula.addFunction('COMPLEXNUMBER', function(a, b) {
  return new ComplexNumber(a, b);
});

Formula.addFunction('ADD_TWO_COMPLEX_NUMBERS', function(cn1, cn2) {
  return new ComplexNumber(cn1.a + cn2.a, cn1.b + cn2.b);
});
```

This will enable you to do this:
```javascript
var formula1 = new Formula('ADD_TWO_COMPLEX_NUMBERS(COMPLEXNUMBER(10,10),COMPLEXNUMBER(1,16))');
var result = formula.calc();    // result is a ComplexNumber object
```

We have already created some usefull datatypes and some related functions. Check out the "datatypes" section in the <a href="http://rosell.dk/formula/demos/">demos</a>


## Initializers
The library contains initializers for conveniently working with formulas.

For example, there is an initializer which enables you to create calculated fields which are automatically recalculated, when the formula changes, just by setting an attribute on an input field. 

Like this:

````HTML
<input data-formula="ADD_TWO_NUMBERS(7,8)" readonly></input>
````


## Bound variables (aka references)
Bound variables signals to the formula, when they change.
Say you have included the "InputById" reference type, you will be able to write a formula like this:

ADD_TWO_NUMBERS(#apples, #oranges)

This sums the values of the input with id set to "apples" and the input with id set to "oranges"
And more importantly: If the user changes any of these values, the formula will get notified (and itself call its changeCallback)

You can add your own reference types too. See this <a href="http://rosell.dk/formula/demos/custom-parser.html">demo</a>, where we create a reference type that parses cell references, enabling us to create formulas like this: SUM(A1, B12)

## Putting it all together
Put this in your head section:

```HTML
<script src="formula/formula.js"></script>

<!-- jQuery (or picoquery) is required by data-formula-attr.js initializer -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>

<!-- For convenience add an initializer, allowing us to specify formulas in the data-formula attribute of input fields -->
<!-- Note: the initializer requires jQuery (or picoquery)-->
<script src="formula/library/initializers/data-formula-attr.js"></script>

<!-- Enable us to reference fields like this: #apples -->
<script src="formula/library/referencetypes/InputById.js"></script>

<script>
Formula.addFunction('ADD_TWO_NUMBERS', function(a, b) {
  return a+b;
});
</script>
```

And you will be able to do this:
```HTML
Apples in basket: <input id="apples"></input><br>
Oranges in basket: <input id="oranges"></input><br>
Fruits in basket: <input data-formula="ADD_TWO_NUMBERS(#apples,#oranges)" readonly></input>
```


## Without initializers

Without initializers, you create formulas like this:

```javascript
  function changeCallback() {
    // here we can react to changes, if the formula contains bound variables (aka references)
  }
  var simpleFormula = new Formula('ADD_TWO_NUMBERS(0.1,9)', changeCallback);
```

To run the calculation, you simply call the "calc()" method:

```javascript
  var result = simpleFormula.calc();
```

## Demos
For convenience, I have put the demos online <a href="http://rosell.dk/formula/demos/">here</a>


## Parser limitations
The parser can parse:
- Function added with the "addFunction" method
- Nested functions
- Numbers
- Strings. Same syntax as in Excel (use doublequotes, not single quotes. And to quote a doublequote, add a doublequote before it. Ie: "My name is ""Sam"""
- Booleans
- Stuff added with the "addParser" method

The parser can not parse:
- Operators. You cannot do this: "9+17". You must rewrite such formulas to use functions instead, ie: SUM(9,17)







