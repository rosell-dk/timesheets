/*
Requires moment.js! (momentjs.com)
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script>

momentjs is the actual data type. 
This file is just adds functions which works on this datatype

With moment, you can set the default format like this:
moment.defaultFormat = 'MM-DD-YYYY';

*/

//alert(moment.prototype.toString);

//moment.defaultFormat = 'MM-DD-YYYY';

//moment.defaultFormat 

/**
 *  A whole bunch of signatures are supported by moment
 *  Here, we just pass the arguments to moment(), so the same signatures are supported here
 *
 *  MOMENT() - Returns moment object representing now
 *  MOMENT([String]) - Not recommended
 *  MOMENT(date [String], format [String]) - Parse date using format. Ie: MOMENT("12-25-1995", "MM-DD-YYYY")
 *  MOMENT(date [String], format [String], strictParsing [Boolean]) - optionally parse in strict mode
 *  MOMENT(date [String], format [String], locale [String], strictParsing [Boolean]) - optionally format with a locale
 *  ...
 * 
 *  Check out the API here: http://momentjs.com/docs/#/parsing/
 *  
 */
Formula.addFunction('MOMENT', function(a, b, c, d) {
  if (arguments.length == 0) return new moment();
  if (arguments.length == 1) return new moment(a);
  if (arguments.length == 2) return new moment(a, b);
  if (arguments.length == 3) return new moment(a, b, c);
  if (arguments.length == 4) return new moment(a, b, c, d);
});


/**
 * Format moment
 * @param momentObj [Moment] - the Moment to format
 * @param format [String] (optional) - The format. If no format is supplied, Moment.defaultFormat will be used
 *
 * Examples: 
 *   'MMMM Do YYYY, h:mm:ss a' -> 'April 12th 2016, 12:59:32 pm'
 *   'dddd' -> 'Tuesday'
 *   'MMM Do YY') -> 'Apr 12th 16
 *   'YYYY [escaped] YYYY'  -> '2016 escaped 2016'
 */
Formula.addFunction('MOMENT_FORMAT', function(momentObj, format) {
  if (!(momentObj instanceof moment)) {
    return 'Wrong type supplied to MOMENT_FORMAT:' + typeof momentObj;
  }
  return momentObj.format(format);
});

/**
 * Use moments very lenient parser
 */
Formula.addFunction('MOMENT_PARSE', function(text, format) {
  return new moment(text, format);
});

/**
 * Use moments strict parser
 */
Formula.addFunction('MOMENT_PARSE_STRICT', function(text, format) {
  return new moment(text, format, true);
});


/** Return year, month, or whatever unit of a date
 *  Units available: 'year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'
 *  http://momentjs.com/docs/#/get-set/set/
 */
Formula.addFunction('MOMENT_GET', function(momentObj, unit) {
  return momentObj.get(unit);
});

/** Set year, month, or whatever unit of a date
 *  Units available: 'year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'
 */
Formula.addFunction('MOMENT_SET', function(momentObj, unit, value) {
  return momentObj.set(unit, value);
});

/** Return day of month (1-31) */
Formula.addFunction('MOMENT_DATE', function(momentObj) {
  return momentObj.date();
});

/** Return zero-indexed month. 0 = January, 1 = February, ... */
Formula.addFunction('MOMENT_MONTH', function(momentObj) {
  return momentObj.month();
});

Formula.addFunction('MOMENT_YEAR', function(momentObj) {
  return momentObj.year();
});

/** Units available: see http://momentjs.com/docs/#/manipulating/add/ 
 */
Formula.addFunction('MOMENT_ADD', function(momentObj, unitsToAdd, units) {
//  return date;
  return momentObj.add(unitsToAdd, units);
});

