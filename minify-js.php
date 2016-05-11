<?php

include('lib/JShrink.php');

$files = array(
  'js/plugins/jquery-1.10.2.min.js',
  'js/plugins/jquery-ui.1.11.4.min.js',
  'js/plugins/moment-2.10.6.min.js',

  // The next two is for time entry
  'js/plugins/jquery.plugin.min.js',
  'js/plugins/jquery.timeentry.min.js',

  'js/plugins/formula.min.js',
  'js/plugins/mdatepicker.min.js'

);

$js = '';
foreach ($files as $i => $filename) {
  $js .= file_get_contents($filename);
//  $js .= '\n';
}

//$js = \JShrink\Minifier::minify($js);

// Disable YUI style comment preservation.
$js = \JShrink\Minifier::minify($js, array('flaggedComments' => false));

file_put_contents('js/plugins.min.js', $js);

?>
