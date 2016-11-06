<?php
/**
 * Created by Nick Belzer
 * Date: 06/11/2016
 *
 * This file contains the layout for the header, this file is used by the
 * headerBuilder class and only this class should use this file. By calling
 * include from that class we get to use the parameters of that class and
 * thus insert the data that was given to the headerBuilder in the header.
 */
?>
<head>
    <title><?php echo $this->title; ?></title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">

    <link rel="stylesheet" href="/includes/styling/main.css">
    <script src="https://use.fontawesome.com/ba5e469969.js"></script>
</head>
