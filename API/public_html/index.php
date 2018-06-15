<?php

// The config file configures the autoloaders for the classes
require('../config/config.php');

try {
    $controller = ControllerFacade::getInstance();
    $controller->processRequest(
        HttpMethod::fromStr($_SERVER['REQUEST_METHOD']),
        $_SERVER['REQUEST_URI'],
        $_GET,
        file_get_contents('php://input'));
} catch (Exception $exception) {
    // Silently log any exception to error log and output server error
    error_log("Error in request: " . $exception->getMessage());
    http_response_code(500);
    die('{"error":"Internal server error"}');
}