Formula.addFunctions(
  ['ALERT', function(obj) {
    alert(obj);
    return obj;
  }],
  ['LOG', function(obj) {
    console.log(obj);
    return obj;
  }]
);
