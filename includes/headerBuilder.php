<?php
/**
 * Created by Nick Belzer
 * Date: 05/11/2016
 *
 * This file contains the basic header information that should be present on each page.
 * Constructs a header based on the given information.
 */

class headerBuilder
{
    var $title;

    /**
     * headerBuilder constructor.
     * @param string $pageTitle The title you want the page to have.
     */
    function __construct($pageTitle)
    {
        $this->title = $pageTitle;
    }

    /**
     * Builds the header from the data we have.
     *
     * Includes html formatted code that represents a header with the data
     * given to this class.
     */
    function buildHeader()
    {
        include "header.php";
    }
}
