function SimpleDate(year, month, day) {
  this.year = year;
  this.month = month;   // month is NOT zero-based
  this.day = day;
  this.valid = true;
}
SimpleDate.defaultFormat = 'MM-DD-YYYY';
SimpleDate.invalidDate = 'Invalid date';

SimpleDate.prototype.toString = function() {
  return this.format();
}

SimpleDate.parse = function(text, format) {
  if (format === undefined) {
    format = SimpleDate.defaultFormat;
  }
  var f = format;

  f = f.replace('MM', '((?:0[1-9])|(?:1[012]))');         // accept 01 - 12
  f = f.replace('DD', '((?:0[1-9])|(?:[12]\\d)|(?:3[01]))');  // accept 01 - 31
  f = f.replace('YYYY', '(\\d\\d\\d\\d)');  // accept 0000 - 9999

  f = f.replace('D', '((?:[12]\\d)|(?:3[01])|(?:[1-9]))'); // accept 1-31, not '01'
  f = f.replace('M', '((?:[1][012])|(?:[1-9]))'); // accept 1-12, not '01'

//  f = f.replace('H', '((?:[0-1]\\d)|(?:2[0-3])|(?:\\d))'); // accept 0-23, - ALSO '00', '01', etc
//  f = f.replace('m', '((?:[0-5]\\d)|(?:\\d))'); // accept 0-59, - ALSO '00', '01', etc

  f = '^' + f + '$';

console.log(f);
  var re = new RegExp(f);
  var result = text.match(re);
  if (result == null) {
    console.log('could not parse "' + text + '" according to format: "' + format + '"');
    var sd = new SimpleDate();
    sd.valid = false;
    return sd;
  }

  // We now have the parts in [1], [2], etc.
  // The order of these parts are the order in which they occured.
  // So, now, we need to sort that out

  var tokensToSearchFor = ['YYYY', 'M', 'D'];
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

  // Now connect the parts

  var now = new Date();

  // default values
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  for (var i=1; i<result.length; i++) {
    var token = positions[i-1].token;
    switch (token) {
      case 'YYYY':
        year = parseInt(result[i], 10);
        break;
      case 'M':
        month = parseInt(result[i], 10);
        break;
      case 'D':
        day = parseInt(result[i], 10);
        break;
    }
  }

  // Lets check if its a valid date
  // we do this by setting a Date object, and reading it to see if its what we set it to

  var d = new Date(year, month - 1, day);
  if ((d.getFullYear() != year) || (d.getMonth() != (month-1)) || (d.getDate() != day) ) {
    var sd = new SimpleDate();
    sd.valid = false;
    return sd;
  }

  return new SimpleDate(year, month, day);

}

SimpleDate.prototype.toDate = function() {
  return new Date(this.year, this.month-1, this.day);
}

/** 
 *  Format 
 *
 */
SimpleDate.prototype.format = function(format) {
  if (!this.valid) {
    return SimpleDate.invalidDate;
  }
  if (format === undefined) {
    format = SimpleDate.defaultFormat;
  }
  var s = format;
  s = s.replace('YYYY', ("0000" + this.year).slice(-4));
  s = s.replace('MM', ("00" + this.month).slice(-2));
  s = s.replace('DD', ("00" + this.day).slice(-2));
  s = s.replace('D', this.day);
  s = s.replace('M', this.month);
  return s;
}

Formula.addFunction('SIMPLEDATE', function(year, month, day) {
  return new SimpleDate(year, month, day);
});


/**
 * Format simpledate
 * @param sd [SimpleDate] - the SimpleDate object to format
 * @param format [String] (optional) - The format. If no format is supplied, SimpleDate.defaultFormat will be used
 *
 *  The following tokens are supported: YYYY, MM, DD, D, M
 *
 * Examples: 
 *   SIMPLEDATE_FORMAT(SIMPLEDATE_NOW(), 'DD-MM-YYYY')
 */
Formula.addFunction('SIMPLEDATE_FORMAT', function(sd, format) {
  return sd.format(format);
});

/**
 *  Examples:
 *     SIMPLEDATE_PARSE('2016-12-24', 'YYYY-DD-MM')
 *
 *  NOTE: ONLY the following tokens are supported: MM, DD, YYYY, D, M
 */
Formula.addFunction('SIMPLEDATE_PARSE', function(text, format) {
  return SimpleDate.parse(text, format);
});

Formula.addFunction('SIMPLEDATE_IS_VALID', function(sd) {
  return sd.valid;
});

Formula.addFunction('SIMPLEDATE_TODAY', function() {
  var d = new Date();
  return new SimpleDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

Formula.addFunction('SIMPLEDATE_NOW', function() {
  var d = new Date();
  return new SimpleDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

/** Return day of month (1-31) */
Formula.addFunction('SIMPLEDATE_DAY', function(sd) {
  return sd.day;
});

/** Return month. 1 = January, 2 = February, ... */
Formula.addFunction('SIMPLEDATE_MONTH', function(sd) {
  return sd.month;
});

Formula.addFunction('SIMPLEDATE_YEAR', function(sd) {
  return sd.year;
});

Formula.addFunction('SIMPLEDATE_SET_DAY', function(sd, day) {
  sd.day = day;
  return sd;
});

Formula.addFunction('SIMPLEDATE_SET_MONTH', function(sd, month) {
  sd.month = month;
  return sd;
});

Formula.addFunction('SIMPLEDATE_SET_YEAR', function(sd, year) {
  sd.year = year;
  return sd;
});

Formula.addFunction('SIMPLEDATE_ADD_DAYS', function(sd, daysToAdd) {
  var ms = sd.toDate().getTime();
  ms += 40000000;  // Turn the time forward to the middle of the day - so we will not get any trouble with daylight saving
  ms += 86400000 * daysToAdd;

  var d = new Date(ms);
  return new SimpleDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

Formula.addFunction('SIMPLEDATE_DAYS_IN_MONTH', function(sd) {
  // http://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
  return new Date(sd.year, sd.month, 0).getDate();
});

/* Note: Excell EOMONTH also takes a second argument */
Formula.addFunction('SIMPLEDATE_EOMONTH', function(sd) {
  // http://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
  var day = new Date(sd.year, sd.month, 0).getDate();
  return new SimpleDate(sd.year, sd.month, day);
});


