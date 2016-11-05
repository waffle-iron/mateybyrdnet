<?php
/**
 * Created by Nick Belzer
 * Date: 05/11/2016
 *
 * File that updates the entire website.
 */

// Get the request by github.
$data = $_REQUEST['payload'];

// Sanitize the data
$unescaped_data = stripslashes($data);

// Set up our object to parse.
$person = json_decode($unescaped_data);

$myfile = fopen("webhook.data", "w");
fwrite($myfile, $person);