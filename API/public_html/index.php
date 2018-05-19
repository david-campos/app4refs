<?php
// The config file configures the autoloaders for the classes
require('../config/config.php');

$controller = ControllerFacade::getInstance();

$controller->processRequest(
    HttpMethod::fromStr($_SERVER['REQUEST_METHOD']),
    $_SERVER['REQUEST_URI'],
    $_GET,
    file_get_contents('php://input'));