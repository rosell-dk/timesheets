<?php
/*
To trigger an Event
Make a POST or GET web request to:

https://maker.ifttt.com/trigger/{event}/with/key/ccrmtGDhWUeKggrlP6wEUH
With an optional JSON body of:

{ "value1" : "", "value2" : "", "value3" : "" }

The data is completely optional, and you can also pass value1, value2, and value3 as query parameters or form variables. This content will be passed on to the Action in your Recipe.

You can also try it with curl from a command line.

curl -X POST https://maker.ifttt.com/trigger/{event}/with/key/ccrmtGDhWUeKggrlP6wEUH
*/


namespace rosell;


/** 
 * Rest API
 * 
 * @author    Bjørn Rosell
 */
class Maker {


  private function query_GET($url) {

    $options = array(
      'http'=>array(
        'method' => $method,
      )
    );
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    //  print_r($response);

    return $response;
    //  $decoded = json_decode($response);
    //  print_r($decoded);

    //  return $decoded;
  }


  private function query_POST($url, $data) {

    // http://stackoverflow.com/questions/5647461/how-do-i-send-a-post-request-with-php


//    $content_type = 'application/json';
//    $content_type = 'multipart/form-data';
    $content_type = 'application/x-www-form-urlencoded';

    $headers = array();
    $headers[] = 'Content-Type: ' . $content_type;
//    $headers[] = 'Content-Length: ' . strlen($content);

    $options = array(
      'http'=>array(
        'method' => 'POST',
        'header' => implode("\r\n", $headers),
        'content' => http_build_query($data)
      )
    );
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
//    print_r($response);

    return $response;
  }

  /**
   * Trigger
   */
  public function trigger($key, $event, $value1 = NULL, $value2 = NULL, $value3 = NULL) {
    $url = 'https://maker.ifttt.com/trigger/' . $event . '/with/key/' . $key;
    $data = array(
      'value1' => $value1,
      'value2' => $value2,
      'value3' => $value3,
    );
//    $data_string = json_encode($data);
//    print_r($data_string);
//    $this->query_POST($url, $data_string);
    $this->query_POST($url, $data);
  }
}

