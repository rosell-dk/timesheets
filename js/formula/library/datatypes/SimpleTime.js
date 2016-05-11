
function SimpleTime(hours, minutes) {
  this.hours = hours;
  this.minutes = minutes;
  this.valid = true;
}
SimpleTime.defaultFormat = 'HH:mm';
SimpleTime.defaultParseFormat = 'H:m';

SimpleTime.invalidTime = 'Invalid time';

SimpleTime.prototype.toString = function() {
  return this.format();
}

SimpleTime.invalidTimeObj = new SimpleTime(0, 0);
SimpleTime.invalidTimeObj.valid = false;

/**
 *  Examples:
 *     SIMPLETIME_PARSE('13:59', 'HH:mm')
 *
 *  NOTE: ONLY the following tokens are supported: HH, mm, H, m
 */
SimpleTime.parse = function(text, format) {
  if (typeof text != 'string') {
//    console.log('could not parse SimpleTime. Expected [string], got: ' + typeof text);
//    console.log(text);
    return SimpleTime.invalidTimeObj;
  }
  if (format === undefined) {
    format = SimpleTime.defaultParseFormat;
  }
  f = format;
  f = f.replace('HH', '((?:0\\d)|(?:1\\d)|(?:2[0-3]))');  // accept 00 - 23
  f = f.replace('mm', '([0-5]\\d)');  // accept 00 - 59

//  f = f.replace('H', '((?:1\\d)|(?:2[0-3])|(?:\\d))'); // accept 0-23, not '01'
//  f = f.replace('m', '((?:[1-5]\\d)|(?:\\d))'); // accept 0-59, not '00', '01' etc

  f = f.replace('H', '((?:[0-1]\\d)|(?:2[0-3])|(?:\\d))'); // accept 0-23, - ALSO '00', '01', etc
  f = f.replace('m', '((?:[0-5]\\d)|(?:\\d))'); // accept 0-59, - ALSO '00', '01', etc

  f = '^' + f + '$';

  var re = new RegExp(f);
  var result = text.match(re);
  if (result == null) {
//    console.log('could not parse "' + text + '" according to format: "' + format + '"');
    return SimpleTime.invalidTimeObj;
  }
  // We now have the parts in [1], [2], etc.
  // The order of these parts are the order in which they occured.
  // So, now, we need to sort that out

  var tokensToSearchFor = ['H', 'm'];
  var positions = [];
  for (var i=0; i<tokensToSearchFor.length; i++) {
    var token = tokensToSearchFor[i];
    var pos = format.indexOf(tokensToSearchFor[i]);
    if (pos != -1) {
      positions.push({
        token: token,
        pos: pos
      });
    }
  }
  positions.sort(function (a, b) {
    if (a.pos > b.pos) {
      return 1;
    }
    if (a.pos < b.pos) {
      return -1;
    }
    return 0;
  });

/*
 console.log(format);  
 console.log(text);  
 console.log(JSON.stringify(positions));  
 console.log(JSON.stringify(result));  */

  // Now connect the parts

  var now = new Date();

  // default values
  var hours = now.getHours();
  var minutes = now.getMinutes();

  for (var i=1; i<result.length; i++) {
    var token = positions[i-1].token;
    switch (token) {
      case 'H':
        hours = parseInt(result[i], 10);
        break;
      case 'm':
        minutes = parseInt(result[i], 10);
        break;
    }
  }

  return new SimpleTime(hours, minutes);
}

/**
 * Format SimpleTime
 * @param sd [SimpleTime] - the SimpleTime object to format
 * @param format [String] (optional) - The format. If no format is supplied, SimpleTime.defaultFormat will be used
 *
 *  The following tokens are supported: HH, mm, H, m
 *
 * Examples: 
 *   SIMPLETIME_FORMAT(SIMPLETIME_NOW(), 'HH:mm')
 */
SimpleTime.prototype.format = function(format) {
  if (!this.valid) {
    return SimpleTime.invalidTime;
  }
  if (format === undefined) {
    format = SimpleTime.defaultFormat;
  }
  var s = format;
  s = s.replace('HH', ("00" + this.hours).slice(-2));
  s = s.replace('mm', ("00" + this.minutes).slice(-2));
  s = s.replace('H', this.hours);
  s = s.replace('m', this.minutes);
  return s;
}

SimpleTime.prototype.toSeconds = function() {
  return this.hours * 3600 + this.minutes * 60;
}

SimpleTime.prototype.toFactoryTime = function() {
  return (this.toSeconds() / 3600);
}

SimpleTime.isValidSimpleTime = function(st) {
  return ((st != null) && (st instanceof SimpleTime) && (st.valid));
}
SimpleTime.subtract = function(st1, st2) {
  if ((!SimpleTime.isValidSimpleTime(st1)) || (!SimpleTime.isValidSimpleTime(st2))) {
    console.log('SimpleTime.subtract failed - wrong arguments');
    console.log(st1);
    console.log(st2);
    return SimpleTime.invalidTimeObj;
  }
  var st1secs = st1.toSeconds();
  var st2secs = st2.toSeconds();
  var secs;
  if (st1secs >= st2secs) {
    secs = st1secs - st2secs;
  }
  else {
    secs = st1secs - st2secs + 24 * 3600;
  }
  return new SimpleTime(Math.floor(secs / 3600), Math.floor((secs % 3600)/60));
}

Formula.addFunctions(

  ['SIMPLETIME', function(hours, minutes) {
    return new SimpleTime(hours, minutes);
  }],

  ['SIMPLETIME_FORMAT', function(st, format) {
    return st.format(format);
  }],

  ['SIMPLETIME_PARSE', function(text, format) {
    return SimpleTime.parse(text, format);
  }],

  ['SIMPLETIME_IS_VALID', function(sd) {
    return sd.valid;
  }],

  ['SIMPLETIME_NOW', function() {
    var d = new Date();
    return new SimpleTime(d.getHours(), d.getMinutes());
  }],

  /** Return hours (1-23) */
  ['SIMPLETIME_HOURS', function(st) {
    return st.hours;
  }],

  /** Return minutes (0-59) */
  ['SIMPLETIME_MINUTES', function(st) {
    return st.minutes;
  }],

  ['SIMPLETIME_SUBTRACT', function(st1, st2) {
    return SimpleTime.subtract(st1, st2);
  }]
);

